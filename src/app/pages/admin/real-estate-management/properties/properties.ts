import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Mirrors PROPERTY_STATUS_TRANSITIONS in
 * `realestate.state.machine.js`. Only legal targets are offered —
 * DRAFT → PUBLISHED must be impossible here exactly as it is there.
 */
export const PROPERTY_TRANSITIONS: { [status: string]: string[] } = {
  DRAFT: [],
  SUBMITTED: ['IN_REVIEW', 'CHANGES_REQUIRED', 'REJECTED'],
  IN_REVIEW: ['APPROVED', 'CHANGES_REQUIRED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'CHANGES_REQUIRED', 'REJECTED'],
  CHANGES_REQUIRED: [],
  PUBLISHED: ['SUSPENDED', 'EXPIRED', 'ARCHIVED'],
  SUSPENDED: ['PUBLISHED', 'ARCHIVED'],
  EXPIRED: ['PUBLISHED', 'ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  SOLD: ['ARCHIVED'],
  RENTED: ['ARCHIVED'],
  ARCHIVED: [],
};

export const PROPERTY_STATUSES: string[] = Object.keys(PROPERTY_TRANSITIONS);

@Component({
  selector: 'app-real-estate-properties',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './properties.html',
})
export class Properties {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  statuses = PROPERTY_STATUSES;
  displayedColumn: string[] = ['code', 'price', 'status', 'availability', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    this.api.get_private('v1/realestate/admin/properties?' + httpParams.toString()).subscribe({
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

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  actionsFor(row: any): string[] {
    return PROPERTY_TRANSITIONS[row.status] || [];
  }

  onChangeStatus(row: any, status: string) {
    this.api
      .patch_private(`v1/realestate/admin/properties/${row._id}/status/${status}`, {})
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }
}
