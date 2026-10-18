import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminCustomerWalletFundInterface } from 'src/app/interfaces/admin.customer.wallet.funds.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogAddWalletFund } from './dialog-add-wallet-fund/dialog-add-wallet-fund';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-wallet-add-fund',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './wallet-add-fund.html',
})
export class WalletAddFund {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  customers = new MatTableDataSource<AdminCustomerWalletFundInterface>([]);
  displayedColumn = ['id', 'name', 'balance', 'points', 'orders', 'total', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';
  exportType: string = 'export';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.getList();
  }

  onSearch() {
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

  getList() {
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/walletFundList?' + httpParams.toString()).subscribe({
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

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const search = this.searchQuery != null && this.searchQuery != '' ? this.searchQuery : 'none';
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/customer/wallet_fund/export/' + exportOption + '/' + search).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'CustomerWalletFunds.xlsx' : 'CustomerWalletFunds.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'customerwalletfunds.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'wallet_funds']);
  }

  addFunds(customer: AdminCustomerWalletFundInterface) {
    const dialogRef = this.dialog.open(DialogAddWalletFund, {
      data: { values: customer },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onUserInfo(item: AdminCustomerWalletFundInterface) {
    console.log(item);
    if (item && item.id && item.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.id]);
    }
  }

}
