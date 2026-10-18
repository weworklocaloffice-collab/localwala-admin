import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { AccountantCashCollectionListInterface } from 'src/app/interfaces/accountant.collect.cash.list.interface';
import { DialogAccountantCollectCash } from './dialog-accountant-collect-cash/dialog-accountant-collect-cash';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-accountant-collect-cash',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './accountant-collect-cash.html',
})
export class AccountantCollectCash {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  cashCollection = new MatTableDataSource<AccountantCashCollectionListInterface>([]);
  displayedColumn = ['name', 'from', 'date', 'amount', 'method', 'reference'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/accountant/collect_cash_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          this.cashCollection = response.results.map((item: AccountantCashCollectionListInterface) => {
            if (item && item.restaurant && item.restaurant.translations) {
              const translation = item.restaurant.translations.find(t => t.code == this.util.appLocaleName());
              item.restaurant.displayName = translation && translation.title ? translation.title : item.restaurant.name;
              item.restaurant.displayAddress = translation && translation.address ? translation.address : item.restaurant.address;
            } else {
              item.restaurant.displayName = item.restaurant.name;
              item.restaurant.displayAddress = item.restaurant.address;
            }
            return item;
          });
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'accountant');
      }
    });
  }

  collectCashDialog() {
    const dialogRef = this.dialog.open(DialogAccountantCollectCash, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.getList();
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

  onDeliverymanDetail(item: AccountantCashCollectionListInterface) {
    console.log(item);
    if (item && item.driverInfo && item.driverInfo.id && item.driverInfo.id != '') {
      this.router.navigate(['/accountant-team/u/deliveryman-detail', item.driverInfo.id]);
    }
  }

  onRestaurantDetail(item: AccountantCashCollectionListInterface) {
    console.log(item);
    if (item && item.from == 'restaurant' && item.restaurant && item.restaurant.id && item.restaurant.id != '') {
      this.router.navigate(['/accountant-team/u/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/cash_collected/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'CollectedCash.xlsx' : 'CollectedCash.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'collectcashes.json';
            this.api.download_export_file(blob, fileName);
          }
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

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
