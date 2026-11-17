import { Component, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsBookingDetail } from '../dialog-ls-booking-detail/dialog-ls-booking-detail';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-bookings',
  imports: [CommonModule, FormsModule, MaterialModule, LsStatusBadge],
  templateUrl: './ls-bookings.html',
})
export class LsBookings {
  isLoaded: boolean = false;
  hasError: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  sortBy: string = '';
  displayedColumn: string[] = ['code', 'mode', 'total', 'payment', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    public api: ApiService,
    public util: UtilService,
    private router: Router,
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
    this.api.get_private('v1/local-services/admin/bookings?' + httpParams.toString()).subscribe({
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
    const fields: any = { code: 'bookingCode', mode: 'bookingMode', total: 'serviceValue', status: 'status' };
    this.sortBy = fields[event.active] && event.direction ? fields[event.active] + ':' + event.direction : '';
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.getList();
  }

  onDetail(row: any) {
    this.router.navigate(['/admin/local-services-management/bookings', row.id || row._id]);
  }
}
