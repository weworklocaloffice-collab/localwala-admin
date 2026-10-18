import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminCustomerListInterface } from 'src/app/interfaces/admin.customer.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  templateUrl: './customer-list.html',
})
export class CustomerList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  customers = new MatTableDataSource<AdminCustomerListInterface>([]);
  displayedColumn = ['id', 'name', 'information', 'orders', 'total', 'joining', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  joiningDate = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  customerStatus: boolean = true;
  customerSort: string = 'newest';
  customerType: string = 'user';
  isFilterApplied: boolean = false;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getList();
  }

  onFilter() {
    this.isFilterApplied = true;
    this.pageSize = 5;
    this.currentPage = 0;
    this.searchQuery = '';
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.customerSort = 'newest';
    this.customerStatus = true;
    this.customerType = 'user';
    this.joiningDate.controls['start'].setValue(null);
    this.joiningDate.controls['end'].setValue(null);
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.customerSort = 'newest';
    this.customerStatus = true;
    this.customerType = 'user';
    this.joiningDate.controls['start'].setValue(null);
    this.joiningDate.controls['end'].setValue(null);
    this.paginator.firstPage();
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let joiningStartDate = '';
    let joiningEndDate = '';
    if (this.joiningDate.controls['start'].value != null && this.joiningDate.controls['end'].value != null) {
      const start = this.joiningDate.controls['start'].value;
      const end = this.joiningDate.controls['end'].value;
      joiningStartDate = DateTime.fromJSDate(start).toFormat('dd/MM/yyyy');
      joiningEndDate = DateTime.fromJSDate(end).toFormat('dd/MM/yyyy');
    }

    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'sortBy': this.customerSort,
      'role': this.customerType,
      'status': this.customerStatus,
      'joiningDate': `${joiningStartDate}-${joiningEndDate}`,
      'search': this.searchQuery
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/getList?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.customers = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.customers);
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

  onStatusChange(event: MatSlideToggleChange, customer: AdminCustomerListInterface) {
    console.log(event);
    console.log(customer);
    customer.status = event.checked;
    this.api.patch_private('v1/admin/customer/update/' + customer.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onView(customer: AdminCustomerListInterface) {
    console.log(customer);
    this.router.navigate(['admin/customer-management/customer-detail', customer.id]);
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      let joiningStartDate = '';
      let joiningEndDate = '';
      if (this.joiningDate.controls['start'].value != null && this.joiningDate.controls['end'].value != null) {
        const start = this.joiningDate.controls['start'].value;
        const end = this.joiningDate.controls['end'].value;
        joiningStartDate = DateTime.fromJSDate(start).toFormat('dd/MM/yyyy');
        joiningEndDate = DateTime.fromJSDate(end).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'sortBy': this.customerSort,
        'role': this.customerType,
        'status': this.customerStatus,
        'joiningDate': `${joiningStartDate}-${joiningEndDate}`,
        'search': this.searchQuery
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/customer/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'Customers.xlsx' : 'Customers.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'customers.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'customers']);
  }

}
