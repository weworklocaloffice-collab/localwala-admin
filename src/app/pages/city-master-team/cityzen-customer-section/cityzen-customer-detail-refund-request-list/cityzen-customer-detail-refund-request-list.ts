import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenCustomerBookingRefundRequestInterface } from 'src/app/interfaces/cityzen.customer.booking.refund.request.interface';
import { CityzenCustomerOrderRefundRequestInterface } from 'src/app/interfaces/cityzen.customer.order.refund.request.interface';
import { CityzenCustomerTiffinPackageRefundRequestInterface } from 'src/app/interfaces/cityzen.customer.tiffin.package.refund.request.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-customer-detail-refund-request-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-customer-detail-refund-request-list.html',
})
export class CityzenCustomerDetailRefundRequestList implements AfterViewInit {

  @Input() userId!: string;
  @ViewChild('orderRefundPaginator', { read: MatPaginator, static: false }) orderRefundPaginator: MatPaginator;
  @ViewChild('tiffinRefundPaginator', { read: MatPaginator, static: false }) tiffinRefundPaginator: MatPaginator;
  @ViewChild('bookingRefundPaginator', { read: MatPaginator, static: false }) bookingRefundPaginator: MatPaginator;
  displayedOrderColumn = ['id', 'date', 'reason', 'payment', 'restaurant', 'status', 'action'];
  displayedTiffinColumn = ['id', 'date', 'subscription', 'reason', 'payment', 'status', 'action'];
  displayedBookingColumn = ['id', 'date', 'reason', 'payment', 'restaurant', 'status', 'action'];
  orderRefundList = new MatTableDataSource<CityzenCustomerOrderRefundRequestInterface>([]);
  tiffinRefundList = new MatTableDataSource<CityzenCustomerTiffinPackageRefundRequestInterface>([]);
  bookingRefundList = new MatTableDataSource<CityzenCustomerBookingRefundRequestInterface>([]);
  pageSizeOrders: number = 5;
  currentPageOrders: number = 0;
  isLoadedOrders: boolean = false;
  pageSizeTiffin: number = 5;
  currentPageTiffin: number = 0;
  isLoadedTiffin: boolean = false;
  pageSizeBooking: number = 5;
  currentPageBooking: number = 0;
  isLoadedBooking: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
  ) {
  }

  ngAfterViewInit() {
    console.log(`------ ${this.userId}`);
    this.getInitial();
  }

  getInitial() {
    this.isLoadedOrders = false;
    this.isLoadedTiffin = false;
    this.isLoadedBooking = false;
    const param: any = {
      'limit': this.pageSizeOrders,
      'page': this.currentPageOrders,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/customer_detail_refund_request_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedOrders = true;
        this.isLoadedTiffin = true;
        this.isLoadedBooking = true;
        if (response && response.orderRefund && response.orderRefund.orderRefundRequest) {
          const mappedList = response.orderRefund.orderRefundRequest.map(
            (item: CityzenCustomerOrderRefundRequestInterface) => {
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
          this.orderRefundList = new MatTableDataSource<CityzenCustomerOrderRefundRequestInterface>(mappedList);
          this.orderRefundPaginator.length = response.orderRefund.totalResultsOrderRefund;
          this.orderRefundPaginator.hidePageSize = response.orderRefund.totalResultsOrderRefund <= 0 ? true : false;
        }

        if (response && response.tiffinRefund && response.tiffinRefund.tiffinRefundRequest) {
          const mappedList = response.tiffinRefund.tiffinRefundRequest.map(
            (item: CityzenCustomerTiffinPackageRefundRequestInterface) => {
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
          this.tiffinRefundList = new MatTableDataSource<CityzenCustomerTiffinPackageRefundRequestInterface>(mappedList);
          this.tiffinRefundPaginator.length = response.tiffinRefund.totalResultsTiffinRefund;
          this.tiffinRefundPaginator.hidePageSize = response.tiffinRefund.totalResultsTiffinRefund <= 0 ? true : false;
        }

        if (response && response.bookingRefund && response.bookingRefund.bookingRefundRequest) {
          const mappedList = response.bookingRefund.bookingRefundRequest.map(
            (item: CityzenCustomerBookingRefundRequestInterface) => {
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
          this.bookingRefundList = new MatTableDataSource<CityzenCustomerBookingRefundRequestInterface>(mappedList);
          this.bookingRefundPaginator.length = response.bookingRefund.totalResultsBookingRefund;
          this.bookingRefundPaginator.hidePageSize = response.bookingRefund.totalResultsBookingRefund <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedOrders = true;
        this.isLoadedTiffin = true;
        this.isLoadedBooking = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  getOrderRefundList() {
    this.isLoadedOrders = false;
    const param: any = {
      'limit': this.pageSizeOrders,
      'page': this.currentPageOrders,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/customer_detail_order_refund_request?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedOrders = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenCustomerOrderRefundRequestInterface) => {
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
          this.orderRefundList = new MatTableDataSource<CityzenCustomerOrderRefundRequestInterface>(mappedList);
          this.orderRefundPaginator.length = response.totalResults;
          this.orderRefundPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedOrders = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onOrderPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageOrders = event.pageIndex + 1;
    this.pageSizeOrders = event.pageSize;
    this.getOrderRefundList();
  }

  getTiffinRefundList() {
    this.isLoadedTiffin = false;
    const param: any = {
      'limit': this.pageSizeTiffin,
      'page': this.currentPageTiffin,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/customer_detail_tiffin_refund_request?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedTiffin = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenCustomerTiffinPackageRefundRequestInterface) => {
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
          this.tiffinRefundList = new MatTableDataSource<CityzenCustomerTiffinPackageRefundRequestInterface>(mappedList);
          this.tiffinRefundPaginator.length = response.totalResults;
          this.tiffinRefundPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedTiffin = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onTiffinPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageTiffin = event.pageIndex + 1;
    this.pageSizeTiffin = event.pageSize;
    this.getTiffinRefundList();
  }

  getBookingRefundList() {
    this.isLoadedBooking = false;
    const param: any = {
      'limit': this.pageSizeBooking,
      'page': this.currentPageBooking,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/customer_detail_dining_refund_request?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedBooking = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenCustomerBookingRefundRequestInterface) => {
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
          this.bookingRefundList = new MatTableDataSource<CityzenCustomerBookingRefundRequestInterface>(mappedList);
          this.bookingRefundPaginator.length = response.totalResults;
          this.bookingRefundPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedBooking = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onBookingPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageBooking = event.pageIndex + 1;
    this.pageSizeBooking = event.pageSize;
    this.getBookingRefundList();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getOrderStatusColor(orderStatus: string) {
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

  onOrderRequestDetail(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['cityzen-team/u/refund-request-info', orderId]);
  }

  getTiffinStatusColor(orderStatus: string) {
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

  onTiffinRequestDetail(purchaseId: string) {
    console.log(`purchaseId -> ${purchaseId}`);
    this.router.navigate(['cityzen-team/u/tiffin-subscription-refund-request', purchaseId]);
  }

  getBookingStatusColor(orderStatus: string) {
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

  onBoookingRequestDetail(bookingId: string) {
    console.log(`Booking Id -> ${bookingId}`);
    this.router.navigate(['cityzen-team/u/dining-booking-refund-request', bookingId]);
  }

}
