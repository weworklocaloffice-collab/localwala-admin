import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminRestaurantWithdrawalRequestInterface } from 'src/app/interfaces/admin.restaurant.withdrawal.request.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-restaurant-withdraws',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './restaurant-withdraws.html',
})
export class RestaurantWithdraws {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  list = new MatTableDataSource<AdminRestaurantWithdrawalRequestInterface>([]);
  displayedColumn = ['id', 'name', 'amount', 'time', 'status', 'action'];
  statusName: string = 'all';
  isLoaded: boolean = false;
  pageSize: number = 5;
  currentPage: number = 0;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'status': this.statusName,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/withdrawalRequest/restaurant?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminRestaurantWithdrawalRequestInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                  item.restaurant.displayAddress = translation?.address || item.restaurant.address;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                  item.restaurant.displayAddress = item.restaurant?.address || '';
                }
              }
              return item;
            }
          );
          this.list = new MatTableDataSource<AdminRestaurantWithdrawalRequestInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onFilterChangeEvent(newStatus: string) {
    console.log(newStatus);
    this.statusName = newStatus;
    this.getList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getStatusColor(requestStatus: string) {
    if (requestStatus == 'created') {
      return 'primary';
    } else if (requestStatus == 'accepted') {
      return 'success';
    } else if (requestStatus == 'rejected') {
      return 'error';
    }
    return 'primary';
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  openDetail(detail: AdminRestaurantWithdrawalRequestInterface) {
    console.log(detail);
    this.router.navigate(['/admin/transaction/withdrawal-request-detail/', detail.id]);
  }

  onRestaurantDetail(item: AdminRestaurantWithdrawalRequestInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id != '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'search': this.searchQuery,
        'status': this.statusName,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/restaurant_withdrawal_request/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'RestaurantWithdrawalRequest.xlsx' : 'RestaurantWithdrawalRequest.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurantwithdrawalrequest.json';
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
