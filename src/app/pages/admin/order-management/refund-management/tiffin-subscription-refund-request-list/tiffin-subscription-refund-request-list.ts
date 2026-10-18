import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminTiffinSubscriptionRefundRequestListInterface } from 'src/app/interfaces/admin.tiffin.subscription.refund.request.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-tiffin-subscription-refund-request-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './tiffin-subscription-refund-request-list.html',
})
export class TiffinSubscriptionRefundRequestList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  requests = new MatTableDataSource<AdminTiffinSubscriptionRefundRequestListInterface>([]);
  displayedColumn = ['id', 'date', 'subscription', 'reason', 'payment', 'customer', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  filterStatus: string = 'all';
  exportType: string = 'export';
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
    this.api.get_private('v1/admin/tiffin_subscription_refund_request/active?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.request) {
          const mappedList = response.request.map(
            (item: AdminTiffinSubscriptionRefundRequestListInterface) => {
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

              if (item && item.packageInfo && item.packageInfo?.id) {
                if (item.packageInfo?.translations) {
                  const translation = item.packageInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.packageInfo.displayName = translation?.title || item.packageInfo.name;
                } else {
                  item.packageInfo.displayName = item.packageInfo?.name || '';
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
          this.requests = new MatTableDataSource<AdminTiffinSubscriptionRefundRequestListInterface>(mappedList);
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

  onRequestDetail(purchaseId: string) {
    console.log(`purchaseId -> ${purchaseId}`);
    this.router.navigate(['admin/order-management/tiffin-subscription-refund-request', purchaseId]);
  }

  onUserInfo(item: AdminTiffinSubscriptionRefundRequestListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: AdminTiffinSubscriptionRefundRequestListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'status': this.filterStatus,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/tiffin_subscription_refund_request/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'TiffinSubscriptionRefund.xlsx' : 'TiffinSubscriptionRefund.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'tiffinsubscriptionrefundrequests.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'tiffin_refund_request']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
