import { Directive, ViewChild } from '@angular/core';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * The shared behaviour of the Local Stores admin lists.
 *
 * The stores vertical has ~60 partner endpoints and, at the time of writing, a much
 * smaller admin surface. Every admin list is the same screen: a paginated table, a
 * search box, a status chip and a guarded action column. So the plumbing lives here
 * once, and a screen that needs something extra extends it rather than copying it.
 *
 * ## Why this does NOT extend `TaxonomyListBase`
 *
 * That base is dairy's, and it is hard-wired to `v1/dairy/admin/catalog/...` and to the
 * dairy response envelope (`results` / `totalResults`). The stores admin endpoints
 * answer with a different envelope (`applications` / `total`, `items` / `total`).
 * Inheriting it and overriding two strings would have produced a base that is dairy's
 * name, dairy's path and stores' shape — a component that lies about where it reads
 * from. So the shared behaviour is declared again here, against the stores envelope.
 *
 * ## The envelope is read, not assumed
 *
 * `rows()` and `total()` below accept several shapes because the stores admin routes
 * are not all written yet and two of them already disagree. Hard-coding one shape
 * means a screen silently renders an empty table against a valid 200 response when a
 * route changes its envelope — which is the exact failure this module exists to avoid.
 */
@Directive()
export abstract class StoresListBase {
  // //// Overridden by each subclass ////
  /** API path under `v1/admin/stores`, e.g. `applications`. */
  path: string = '';
  /** Row shown in the table header. */
  listTitleKey: string = '';
  /** Columns for `mat-table`. */
  displayedColumn: string[] = [];

  /**
   * Extra query parameters merged into every request.
   *
   * A GETTER, not a property. A subclass narrowing this screen to one parent must be able
   * to write `get extraQuery()`, and a base property cannot be overridden by an accessor —
   * TypeScript rejects it (TS2611). The dairy base solves this by declaring a method,
   * which forces every subclass to write `extraQuery()` instead of a bare field; a getter
   * keeps the natural `get extraQuery()` syntax at the call site.
   */
  get extraQuery(): any {
    return {};
  }

  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  searchQuery: string = '';
  /** `status` is a string on the query string but a boolean on the model. */
  statusFilter: string = '';

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

  /**
   * Pull the rows out of whatever envelope this endpoint uses.
   *
   * Returns an empty array rather than undefined so a template can iterate without a
   * guard on every row.
   */
  /** `MatDialog` service. Named `dialogRef` for historical reasons; use `dialog`. */
  get dialog(): MatDialog {
    return this.dialogRef;
  }

  rows(response: any): any[] {
    if (!response) return [];
    return (
      response.applications ||
      response.items ||
      response.results ||
      response.taxConfigurations ||
      response.chains ||
      []
    );
  }

  /**
   * The row count, from whichever key carries it.
   *
   * `total` is checked before `totalResults` deliberately: a response carrying both is
   * a stores envelope, and its `total` is the authoritative page size.
   */
  total(response: any): number {
    if (!response) return 0;
    return response.total !== undefined
      ? response.total
      : response.totalResults !== undefined
        ? response.totalResults
        : this.rows(response).length;
  }

  getList() {
    this.isLoaded = false;

    const param: any = {
      limit: this.pageSize,
      page: this.currentPage + 1,
      search: this.searchQuery,
    };
    Object.assign(param, this.extraQuery);

    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      // An unset filter is left off the query entirely. Several of these are validated
      // as ObjectIds server-side, so an empty string is a 400 rather than "no filter".
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api
      .get_private('v1/admin/stores/' + this.path + '?' + httpParams.toString())
      .subscribe({
        next: (response: any) => {
          this.list = this.rows(response);
          if (this.paginator) {
            this.paginator.length = this.total(response);
            this.paginator.hidePageSize = this.total(response) <= 0;
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

  /** Success toast key after an archive. Set by screens whose backend archives. */
  archivedKey: string = '';

  /**
   * Boolean status toggle. Only wired by screens whose backend exposes a
   * PATCH status route (e.g. catalog attribute-templates). Tax and chains
   * intentionally have no toggle: tax rates are append-only (BR-41) and
   * chains have no mutation routes.
   */
  onStatusChange(element: any, checked: boolean) {
    this.patch(this.path + '/' + element._id, { status: checked }, checked ? 'ts_entity_enabled' : 'ts_entity_disabled');
  }

  /**
   * Archive, never delete (BR-25). Only wired by screens whose backend
   * exposes an archiving DELETE route.
   */
  onArchive(element: any) {
    const ref = this.dialog.open(ConfirmDialog, {
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
        this.api.delete_private('v1/admin/stores/' + this.path + '/' + element._id).subscribe({
          next: () => {
            if (this.archivedKey) this.util.onSuccess(this.archivedKey);
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

  /** Re-read the current page. Used after a mutation and after a failed toggle. */
  refresh() {
    this.getList();
  }

  post(path: string, body: any, successKey?: string) {
    this.api.post_private('v1/admin/stores/' + path, body).subscribe({
      next: () => {
        if (successKey) this.util.onSuccess(successKey);
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  patch(path: string, body: any, successKey?: string) {
    this.api.patch_private('v1/admin/stores/' + path, body).subscribe({
      next: () => {
        if (successKey) this.util.onSuccess(successKey);
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
        // Re-read so a row never keeps displaying a state the database rejected.
        this.getList();
      },
    });
  }
}