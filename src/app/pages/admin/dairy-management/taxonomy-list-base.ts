import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';

/**
 * The shared behaviour of the three dairy taxonomy lists.
 *
 * Categories, sub-categories and brands are the same screen three times over: a
 * paginated table, a create/edit dialog, a status toggle and a guarded delete. The
 * three differ only in their path, their columns and the extra field on their
 * dialog, so the plumbing lives here once instead of being copied and drifting.
 *
 * Subclasses set the four `...Config` fields in their constructor and inherit
 * everything else. Nothing here knows about dairy specifically.
 */
@Component({
  selector: 'app-taxonomy-list-base',
  imports: [CommonModule, FormsModule, MaterialModule],
  template: '',
})
export class TaxonomyListBase {
  // //// Overridden by each subclass ////

  /** API path segment, e.g. `categories`. */
  path: string = '';
  /** Row shown in the table header, e.g. `dairy_category_list`. */
  listTitleKey: string = '';
  /** Dialog component for create/edit. */
  dialog: any = null;
  /** Columns for `mat-table`. */
  displayedColumn: string[] = [];
  /** i18n keys for the toasts, so each screen speaks in its own noun. */
  addedKey: string = '';
  updatedKey: string = '';
  deletedKey: string = '';

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
      limit: this.pageSize,
      page: this.currentPage,
      search: this.searchQuery,
    };

    // Screen-specific filters (e.g. sub-categories narrowed to one parent). Merged
    // here rather than overridden per screen, because `onPageChange` calls straight
    // into `getList` and an override would silently drop the filter on page 2.
    Object.assign(param, this.extraQueryParams());

    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      // An unset filter is left off the query entirely: the API validates these as
      // ObjectIds, so an empty string would be a 400 rather than "no filter".
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api
      .get_private('v1/dairy/admin/catalog/' + this.path + '?' + httpParams.toString())
      .subscribe({
        next: (response: any) => {
          if (response && response.results) {
            this.list = response.results;
            this.paginator.length = response.totalResults;
            this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          }
          this.isLoaded = true;
        },
        error: (error: any) => {
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  /** Extra query parameters for this screen. Empty in the base. */
  extraQueryParams(): any {
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

  onCreate() {
    const dialogRef = this.dialogRef.open(this.dialog, {
      data: { action: 'create' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == 'add') {
        this.util.onSuccess(this.addedKey);
        this.getList();
      }
    });
  }

  onEdit(element: any) {
    const dialogRef = this.dialogRef.open(this.dialog, {
      data: { action: 'edit', values: element },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == 'update') {
        this.util.onSuccess(this.updatedKey);
        this.getList();
      }
    });
  }

  onDelete(element: any) {
    const dialogRef = this.dialogRef.open(ConfirmDialog, {
      data: {
        title: 'ts_are_you_sure',
        subTitle: 'ts_dairy_delete_instruction',
        okTitle: 'ts_yes_delete_it',
        closeTitle: 'ts_cancel',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.action == 'confirm') {
        this.api
          .delete_private('v1/dairy/admin/catalog/' + this.path + '/' + element._id)
          .subscribe({
            next: (response: any) => {
              this.util.onSuccess(this.deletedKey);
              this.getList();
            },
            error: (error: any) => {
              // The service refuses to delete a taxonomy row that a product still
              // points at, and says why. That message is the useful one to show, so
              // it is preferred over the generic failure text.
              const apiMessage =
                error && error.error && error.error.message ? error.error.message : '';
              if (/reference/i.test(apiMessage)) {
                this.util.onError('ts_dairy_taxonomy_in_use', '');
              } else {
                this.util.handleError(error, 'admin');
              }
            },
          });
      }
    });
  }

  /**
   * Flips a row's status.
   *
   * On failure the list is re-read, because leaving the toggle showing the state the
   * operator just tried to set is worse than a momentary flicker — it would report
   * a status the database does not hold.
   */
  onStatusChange(element: any, event: any) {
    this.api
      .patch_private('v1/dairy/admin/catalog/' + this.path + '/' + element._id, {
        status: event.checked,
      })
      .subscribe({
        next: (response: any) => {
          this.util.onSuccess(event.checked ? 'ts_entity_enabled' : 'ts_entity_disabled');
          this.getList();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
          this.getList();
        },
      });
  }
}
