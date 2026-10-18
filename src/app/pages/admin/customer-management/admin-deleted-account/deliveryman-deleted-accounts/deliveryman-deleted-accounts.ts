import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminDeliverymanDeletedAccountListInterface } from 'src/app/interfaces/admin.deliveryman.deleted.account.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-deliveryman-deleted-accounts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './deliveryman-deleted-accounts.html',
})
export class DeliverymanDeletedAccounts {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  deliveryman = new MatTableDataSource<AdminDeliverymanDeletedAccountListInterface>([]);
  displayedColumn = ['name', 'reason', 'city', 'wallet', 'orders', 'stats', 'rating', 'datetime'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
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
    this.api.get_private('v1/admin/deliveryman/deleted_deliveryman?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDeliverymanDeletedAccountListInterface) => {
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }

              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.deliveryman = new MatTableDataSource<AdminDeliverymanDeletedAccountListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        console.log(this.deliveryman);
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

  onCity(item: AdminDeliverymanDeletedAccountListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
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
      this.api.export_collection('v1/admin/deliveryman/deleted_deliveryman/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DeliverymanDeletedAccounts.xlsx' : 'DeliverymanDeletedAccounts.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'deleteddeliverymanaccounts.json';
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

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
