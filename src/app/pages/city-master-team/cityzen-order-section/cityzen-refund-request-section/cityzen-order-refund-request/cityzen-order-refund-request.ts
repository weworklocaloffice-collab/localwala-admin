import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenRefundRequestListInterface } from 'src/app/interfaces/cityzen.refund.request.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-order-refund-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-order-refund-request.html',
})
export class CityzenOrderRefundRequest {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  requests = new MatTableDataSource<CityzenRefundRequestListInterface>([]);
  displayedColumn = ['id', 'date', 'reason', 'payment', 'customer', 'restaurant', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  filterStatus: string = 'all';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'status': this.filterStatus,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/order_refund_request/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.request) {
          const mappedList = response.request.map(
            (item: CityzenRefundRequestListInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }

              if (item && item.paymentInfo && item.paymentInfo?.id) {
                if (item.paymentInfo?.translations) {
                  const translation = item.paymentInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.paymentInfo.displayName = translation?.value || item.paymentInfo.name;
                } else {
                  item.paymentInfo.displayName = item.paymentInfo?.name || '';
                }
              }

              if (item && item.reason && item.reason?.id) {
                if (item.reason?.translations) {
                  const translation = item.reason.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reason.displayName = translation?.value || item.reason.name;
                } else {
                  item.reason.displayName = item.reason?.name || '';
                }
              }
              return item;
            }
          );
          this.requests = new MatTableDataSource<CityzenRefundRequestListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
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

  getStatusColor(orderStatus: string) {
    const okOrderStatus = ['initiated'];
    const successOrderStatus = ['refunded', 'partially_refunded'];
    const failedOrderStatus = ['cancelled'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onFilterChangeEvent(newStatus: string) {
    console.log(newStatus);
    this.filterStatus = newStatus;
    this.getList();
  }

  onRequestDetail(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['cityzen-team/u/refund-request-info', orderId]);
  }

  onUserInfo(item: CityzenRefundRequestListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['cityzen-team/u/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: CityzenRefundRequestListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurant.id]);
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
