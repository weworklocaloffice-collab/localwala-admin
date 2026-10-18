import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminUserPurchasedTiffinSubscriptionListInterface } from 'src/app/interfaces/admin.user.purchased.tiffin.subscription.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-admin-user-purchased-tiffin-subscription-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './admin-user-purchased-tiffin-subscription-list.html',
})
export class AdminUserPurchasedTiffinSubscriptionList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  purchased = new MatTableDataSource<AdminUserPurchasedTiffinSubscriptionListInterface>([]);
  displayedColumn = ['id', 'name', 'restaurant', 'customer', 'start', 'total', 'status', 'action'];
  id: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'id': this.id,
      'search': this.searchQuery,
    };
    this.api.post_private('v1/admin/tiffin_packages/adminTiffinSubscriptionPurchased/', param).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminUserPurchasedTiffinSubscriptionListInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }

              if (item && item.package && item.package?.id) {
                if (item.package?.translations) {
                  const translation = item.package.translations.find((t) => t.code == this.util.appLocaleName());
                  item.package.displayName = translation?.title || item.package.name;
                } else {
                  item.package.displayName = item.package?.name || '';
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
              return item;
            }
          );
          this.purchased = new MatTableDataSource<AdminUserPurchasedTiffinSubscriptionListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.purchased);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onView(purchased: AdminUserPurchasedTiffinSubscriptionListInterface) {
    console.log(purchased);
    this.router.navigate(['admin/order-management/user-purchased-tiffin-subscription-info/', purchased.id]);
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
    const okOrderStatus = ['created'];
    const successOrderStatus = ['completed'];
    const failedOrderStatus = ['cancelled', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onUserInfo(item: AdminUserPurchasedTiffinSubscriptionListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: AdminUserPurchasedTiffinSubscriptionListInterface) {
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
        'id': this.id,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/tiffin_packages/purchased/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'UserPurchasedTiffinSubscription.xlsx' : 'UserPurchasedTiffinSubscription.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'userpurchasedtiffinsubscriptions.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'tiffin_purchased_list']);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
