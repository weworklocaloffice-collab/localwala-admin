import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { SupportTeamCustomerListInterface } from 'src/app/interfaces/support.team.customer.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSupportTeamCustomerDetail } from './dialog-support-team-customer-detail/dialog-support-team-customer-detail';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-support-team-customer-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  templateUrl: './support-team-customer-list.html',
})
export class SupportTeamCustomerList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  customers = new MatTableDataSource<SupportTeamCustomerListInterface>([]);
  displayedColumn = ['id', 'name', 'information', 'orders', 'total', 'support', 'joining', 'action'];
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
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
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
      joiningStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
      joiningEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
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
    this.api.get_private('v1/support_team/customer_list?' + httpParams.toString()).subscribe({
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
        this.util.handleError(error, 'support-team');
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

  onDetail(item: SupportTeamCustomerListInterface) {
    console.log(item);
    this.dialog.open(DialogSupportTeamCustomerDetail, {
      data: { id: item.id },
      disableClose: true
    });
  }

}
