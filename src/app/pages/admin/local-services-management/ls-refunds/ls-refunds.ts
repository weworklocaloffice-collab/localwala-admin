import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-refunds',
  imports: [CommonModule, FormsModule, MaterialModule, LsStatusBadge],
  templateUrl: './ls-refunds.html',
})
export class LsRefunds {
  isLoaded: boolean = false;
  hasError: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = 'requested';
  sortBy: string = '';
  actingOn: string | null = null;
  displayedColumn: string[] = ['booking', 'amount', 'status', 'action'];

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
    this.hasError = false;
    const param: any = { limit: this.pageSize, page: this.currentPage + 1, status: this.selectedStatus, sortBy: this.sortBy };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) return;
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/local-services/admin/refunds?' + httpParams.toString()).subscribe({
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
        this.hasError = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onSortChange(event: any) {
    const fields: any = { amount: 'requestedAmount', status: 'status' };
    this.sortBy = fields[event.active] && event.direction ? fields[event.active] + ':' + event.direction : '';
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.getList();
  }

  decide(row: any, decision: string) {
    const rowId = row.id || row._id;
    this.actingOn = rowId + decision;
    this.api.post_private('v1/local-services/admin/refunds/' + rowId + '/decision', { decision }).subscribe({
      next: () => {
        this.actingOn = null;
        this.util.onSuccess(decision === 'approved' ? 'ts_refund_approved' : 'ts_refund_rejected');
        this.getList();
      },
      error: (error: any) => {
        this.actingOn = null;
        this.util.handleError(error, 'admin');
      },
    });
  }

  retry(row: any) {
    const rowId = row.id || row._id;
    this.actingOn = rowId + 'retry';
    this.api.post_private('v1/local-services/admin/refunds/' + rowId + '/retry', {}).subscribe({
      next: () => {
        this.actingOn = null;
        this.util.onSuccess('ts_refund_approved');
        this.getList();
      },
      error: (error: any) => {
        this.actingOn = null;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
