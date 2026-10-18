import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AccountantWalletTransactionReportInterface } from 'src/app/interfaces/accountant.wallet.transaction.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-wallet-transaction-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule, NgIcon],
  templateUrl: './accountant-wallet-transaction-report.html',
})
export class AccountantWalletTransactionReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AccountantWalletTransactionReportInterface>([]);
  displayedColumn = ['id', 'customer', 'kind', 'amount', 'date'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  filterDates = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  isFilterApplied: boolean = false;
  customerRole: string = 'user';
  transactionStatus: string = 'deposite';
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

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.customerRole = 'user';
    this.transactionStatus = 'deposite';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.customerRole = 'user';
    this.transactionStatus = 'deposite';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.searchQuery = '';
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let filterStartDate = '';
    let filterEndDate = '';
    if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
      const start = this.filterDates.controls['start'].value;
      const end = this.filterDates.controls['end'].value;
      filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
      filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
    }

    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'status': this.transactionStatus,
      'role': this.customerRole,
      'filterDates': `${filterStartDate}-${filterEndDate}`,
      'search': this.searchQuery
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/wallet_transaction_report?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.reports = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'accountant');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      let filterStartDate = '';
      let filterEndDate = '';
      if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
        const start = this.filterDates.controls['start'].value;
        const end = this.filterDates.controls['end'].value;
        filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
        filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'status': this.transactionStatus,
        'role': this.customerRole,
        'filterDates': `${filterStartDate}-${filterEndDate}`,
        'search': this.searchQuery
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/reports/wallet_transaction/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'WalletTransactions.xlsx' : 'WalletTransactions.csv';
          this.api.download_export_file(blob, fileName);
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'accountant');
        }
      });
    }
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onUserInfo(item: AccountantWalletTransactionReportInterface) {
    console.log(item);
    if (item.userInfo.role == 'user' || item.userInfo.role == 'guest') {
      this.router.navigate(['/accountant-team/u/customer-detail', item.userInfo.id]);
    } else if (item.userInfo.role == 'driver' || item.userInfo.role == 'vendorDriver') {
      this.router.navigate(['/accountant-team/u/deliveryman-detail', item.userInfo.id]);
    }
  }

}
