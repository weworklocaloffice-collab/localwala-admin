import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';

/**
 * Shared behaviour for the four Local Stores taxonomy screens.
 *
 * ## Why this is separate from the dairy `TaxonomyListBase`
 *
 * That base is hard-wired to `v1/dairy/admin/catalog/...` and to the dairy response
 * envelope (`results` / `totalResults`). These endpoints answer with the same envelope,
 * but they live at `v1/admin/stores/catalog/...` and — critically — their DELETE does not
 * delete. Inheriting the dairy base would have inherited a delete that removes rows, and
 * BR-25 forbids that on anything a product references. So the behaviour is declared again
 * here, against the stores archive semantics.
 */
@Component({
  selector: 'app-stores-taxonomy-base',
  imports: [CommonModule, FormsModule, MaterialModule],
  template: '',
})
export class StoresTaxonomyBase {
  // //// Overridden by each subclass ////

  /** Path segment under `v1/admin/stores/catalog`. */
  path: string = '';
  listTitleKey: string = '';
  displayedColumn: string[] = [];
  dialog: any = null;
  addedKey: string = '';
  updatedKey: string = '';
  archivedKey: string = '';
  /** `status` is a string on the query string but a boolean on the model. */
  statusFilter: string = '';

  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  searchQuery: string = '';

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;

    const param: any = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchQuery,
      status: this.statusFilter,
    };
    Object.assign(param, this.extraQuery());

    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) return;
      httpParams = httpParams.set(key, param[key]);
    });

    this.api
      .get_private('v1/admin/stores/catalog/' + this.path + '?' + httpParams.toString())
      .subscribe({
        next: (response: any) => {
          this.list = response && response.results ? response.results : [];
          if (this.paginator) {
            this.paginator.length = response && response.totalResults ? response.totalResults : 0;
            this.paginator.hidePageSize = !response || !response.totalResults;
          }
          this.isLoaded = true;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.list = [];
          this.util.handleError(error, 'admin');
        },
      });
  }

  extraQuery(): any {
    return {};
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  onStatusFilter(status: string) {
    this.statusFilter = status;
    this.currentPage = 0;
    this.getList();
  }

  onCreate() {
    const ref = this.dialogRef.open(this.dialog, { data: { action: 'create' }, disableClose: true });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'add') {
        this.util.onSuccess(this.addedKey);
        this.getList();
      }
    });
  }

  onEdit(element: any) {
    const ref = this.dialogRef.open(this.dialog, {
      data: { action: 'edit', values: element },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'update') {
        this.util.onSuccess(this.updatedKey);
        this.getList();
      }
    });
  }

  /**
   * Archive, not delete.
   *
   * The confirm dialog says "archive" rather than "delete" on purpose: the endpoint is a
   * DELETE, but nothing is removed. Wording that says delete would train an operator to
   * expect data loss and stop reading the confirmation.
   *
   * A 409 here means something still references the row. The service's message names
   * what — "referenced by 3 subcategory(ies) and 12 product(s)" — so it is shown as-is
   * instead of being replaced by a generic failure.
   */
  onArchive(element: any) {
    const ref = this.dialogRef.open(ConfirmDialog, {
      data: {
        title: 'ts_are_you_sure',
        subTitle: 'stores_archive_instruction',
        okTitle: 'ts_yes_archive_it',
        closeTitle: 'ts_cancel',
      },
      disableClose: true,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result && result.action === 'confirm') {
        this.api
          .delete_private('v1/admin/stores/catalog/' + this.path + '/' + element._id)
          .subscribe({
            next: () => {
              this.util.onSuccess(this.archivedKey);
              this.getList();
            },
            error: (error: any) => {
              const apiMessage =
                error && error.error && error.error.message ? error.error.message : '';
              if (/referenced/i.test(apiMessage)) {
                this.util.onError(apiMessage, '');
              } else {
                this.util.handleError(error, 'admin');
              }
            },
          });
      }
    });
  }

  onStatusChange(element: any, checked: boolean) {
    this.api
      .patch_private('v1/admin/stores/catalog/' + this.path + '/' + element._id, {
        status: checked,
      })
      .subscribe({
        next: () => {
          this.util.onSuccess(checked ? 'ts_entity_enabled' : 'ts_entity_disabled');
          this.getList();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
          // Re-read, so the toggle never keeps showing a state the database rejected.
          this.getList();
        },
      });
  }
}