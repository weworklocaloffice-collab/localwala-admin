import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminDeliverymanWalletFundInterface } from 'src/app/interfaces/admin.deliveryman.wallet.fund.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogAddWalletFund } from 'src/app/pages/admin/customer-management/wallet-add-fund/dialog-add-wallet-fund/dialog-add-wallet-fund';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-deliveryman-wallet-bonus',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './deliveryman-wallet-bonus.html',
})
export class DeliverymanWalletBonus {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  deliverymans = new MatTableDataSource<AdminDeliverymanWalletFundInterface>([]);
  displayedColumn = ['id', 'name', 'kind', 'balance', 'orders', 'total', 'action'];
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
    this.api.get_private('v1/admin/driver/walletFundList?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.deliverymans = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.deliverymans);
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
      const spinnerRef = this.util.start();
      const query = this.searchQuery != null && this.searchQuery != '' ? this.searchQuery : 'none'
      this.api.export_collection('v1/admin/driver/wallet_fund/export/' + exportOption + '/' + query).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DeliverymanFunds.xlsx' : 'DeliverymanFunds.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'deliverymanfunds.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'deliveryman_wallet_funds']);
  }

  addFunds(deliveryman: AdminDeliverymanWalletFundInterface) {
    const dialogRef = this.dialog.open(DialogAddWalletFund, {
      data: { values: deliveryman },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
      }
    });
  }

  onDeliverymanInfo(item: AdminDeliverymanWalletFundInterface) {
    console.log(item);
    if (item.id && item.id != '') {
      this.router.navigate(['admin/driver-management/deliveryman-details', item.id]);
    }
  }

}
