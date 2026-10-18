import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { VendorOrderListInterface } from 'src/app/interfaces/vendor.order.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-vendor-preparing-order-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './vendor-preparing-order-list.html',
})
export class VendorPreparingOrderList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<VendorOrderListInterface>([]);
  displayedColumn = ['id', 'date', 'customer', 'item', 'total', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    console.log('get order list');
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'orderStatus': 'preparing',
      'vendorId': this.util.getItem('_vendorId')
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/vendor_web/orders/webList?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.orders) {
          const mappedList = response.orders.map(
            (item: VendorOrderListInterface) => {
              if (item && item.paymentInfo && item.paymentInfo?.id) {
                if (item.paymentInfo?.translations) {
                  const translation = item.paymentInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.paymentInfo.displayName = translation?.value || item.paymentInfo.name;
                } else {
                  item.paymentInfo.displayName = item.paymentInfo?.name || '';
                }
              }

              item.cartItem?.map((cartItem) => {
                const optionNameList: string[] = [];
                if (cartItem.translations) {
                  const translation = cartItem.translations.find((t) => t.code == this.util.appLocaleName());
                  cartItem.displayName = translation?.title || cartItem.name;
                  cartItem.displayShortDescription = translation?.shortDescription || cartItem.shortDescription;
                } else {
                  cartItem.displayName = cartItem?.name || '';
                  cartItem.displayShortDescription = cartItem?.shortDescription || '';
                }

                cartItem.addons?.map((addonItem) => {
                  if (addonItem.translations) {
                    const translation = addonItem.translations.find((t) => t.code == this.util.appLocaleName());
                    addonItem.displayName = translation?.value || addonItem.name;
                  } else {
                    addonItem.displayName = addonItem?.name || '';
                  }
                  optionNameList.push(addonItem.displayName);
                });

                cartItem.variations?.map((variationElement) => {
                  variationElement?.options?.map((optionElement) => {
                    optionNameList.push(optionElement.name);
                  });
                });

                cartItem.optionName = optionNameList.join(',');
              });
              return item;
            }
          );
          this.orders = new MatTableDataSource<VendorOrderListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
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

  convertOrderCount(num: number) {
    let suffix = "th";
    if (num % 10 == 1 && num % 100 != 11) {
      suffix = "st";
    } else if (num % 10 == 2 && num % 100 != 12) {
      suffix = "nd";
    } else if (num % 10 == 3 && num % 100 != 13) {
      suffix = "rd";
    }
    return num + suffix;
  }

  onOrderDetailPage(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['vendor/order-management/order-detail', orderId]);
  }

  onPrintInvoice(orderId: string) {
    this.router.navigate(['vendor/order-management/order-invoice', orderId]);
  }

}
