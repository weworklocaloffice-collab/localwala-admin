import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminLoyaltyPointsReportListInterface } from 'src/app/interfaces/admin.loyalty.points.report.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-loyalty-point-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  templateUrl: './loyalty-point-report.html',
})
export class LoyaltyPointReport {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  points = new MatTableDataSource<AdminLoyaltyPointsReportListInterface>([]);
  displayedColumn = ['id', 'name', 'points', 'from', 'redeemed', 'date'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  isFilterApplied: boolean = false;
  loyaltyType: string = 'order';
  loyaltyStatus: boolean = true;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
  }

  onFilter() {
    this.isFilterApplied = true;
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.loyaltyStatus = true;
    this.loyaltyType = 'order';
    this.dateRange.controls['start'].setValue(null);
    this.dateRange.controls['end'].setValue(null);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let startDate = '';
    let endDate = '';
    if (this.dateRange.controls['start'].value != null && this.dateRange.controls['end'].value != null) {
      const start = this.dateRange.controls['start'].value;
      const end = this.dateRange.controls['end'].value;
      startDate = DateTime.fromJSDate(start).toFormat('dd/MM/yyyy');
      endDate = DateTime.fromJSDate(end).toFormat('dd/MM/yyyy');
    }

    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'type': this.loyaltyType,
      'status': this.loyaltyStatus,
      'range': `${startDate}-${endDate}`,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/loyaltyPointsReport?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.points = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.points);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      let startDate = '';
      let endDate = '';
      if (this.dateRange.controls['start'].value != null && this.dateRange.controls['end'].value != null) {
        const start = this.dateRange.controls['start'].value;
        const end = this.dateRange.controls['end'].value;
        startDate = DateTime.fromJSDate(start).toFormat('dd/MM/yyyy');
        endDate = DateTime.fromJSDate(end).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'filterType': this.loyaltyType,
        'status': this.loyaltyStatus,
        'range': `${startDate}-${endDate}`,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/customer/loyalty_points/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'CustomerLoyaltyPoints.xlsx' : 'CustomerLoyaltyPoints.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'customerloyaltypoints.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  importCollection() {
    this.router.navigate(['admin/import-export-management/import-collection/', 'loyality_points']);
  }

  onUserDetail(point: AdminLoyaltyPointsReportListInterface) {
    this.router.navigate(['admin/customer-management/customer-detail', point.userInfo.id]);
  }

  onOrderDetailPage(point: AdminLoyaltyPointsReportListInterface) {
    this.router.navigate(['admin/order-management/order-details', point.orderId]);
  }

  onCoupon(point: AdminLoyaltyPointsReportListInterface) {
    this.router.navigate(['admin/coupons/edit-coupon/', point.coupon]);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
