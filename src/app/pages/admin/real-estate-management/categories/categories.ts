import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogCategory } from '../dialog-category/dialog-category';

const GROUP_OPTIONS = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL'];

@Component({
  selector: 'app-real-estate-categories',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './categories.html',
})
export class Categories {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedGroup: string = '';
  groups = GROUP_OPTIONS;
  displayedColumn: string[] = ['key', 'name', 'group', 'fields', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedGroup) {
      httpParams = httpParams.set('group', this.selectedGroup);
    }
    this.api.get_private('v1/realestate/admin/categories?' + httpParams.toString()).subscribe({
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

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  /**
   * Number of declared spec fields for a category, surfaced as a small
   * badge so the admin can see at a glance whether a row is meaningfully
   * configured or empty. Returns 0 when the field array is missing.
   */
  fieldCount(row: any): number {
    return row && row.specSchema && Array.isArray(row.specSchema.fields)
      ? row.specSchema.fields.length
      : 0;
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onCreate() {
    this.dialog
      .open(DialogCategory, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogCategory, { disableClose: true, data: row })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onDelete(row: any) {
    // The util service has no `confirmDelete` helper; use the native
    // confirm dialog so the screen is self-contained.
    if (!confirm(`Delete this category? ${row.name}`)) return;
    this.api.delete_private(`v1/realestate/admin/categories/${row._id}`).subscribe({
      next: () => {
        this.util.onSuccess('ts_deleted');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
