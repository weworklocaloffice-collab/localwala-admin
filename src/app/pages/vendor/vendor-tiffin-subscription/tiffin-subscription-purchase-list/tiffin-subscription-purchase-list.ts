import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { VendorTiffinSubscriptionUserPurchasedListInterface } from 'src/app/interfaces/vendor.tiffin.subscription.user.purchased.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-tiffin-subscription-purchase-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './tiffin-subscription-purchase-list.html',
})
export class TiffinSubscriptionPurchaseList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  purchased = new MatTableDataSource<VendorTiffinSubscriptionUserPurchasedListInterface>([]);
  displayedColumn = ['customer', 'id', 'start', 'total', 'status', 'action'];
  id: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

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
      'vendor': this.util.getItem('_vendorId'),
      'limit': this.pageSize,
      'page': this.currentPage,
      'id': this.id
    };
    this.api.post_private('v1/vendor_web/tiffin_packages/vendorTiffinSubscriptionPurchased/', param).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: VendorTiffinSubscriptionUserPurchasedListInterface) => {
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
          this.purchased = new MatTableDataSource<VendorTiffinSubscriptionUserPurchasedListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.purchased);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onView(purchased: VendorTiffinSubscriptionUserPurchasedListInterface) {
    console.log(purchased);
    this.router.navigate(['vendor/subscription-tiffin-management/purchased-tiffin-subscription-purchase-info/', purchased.id]);
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

}
