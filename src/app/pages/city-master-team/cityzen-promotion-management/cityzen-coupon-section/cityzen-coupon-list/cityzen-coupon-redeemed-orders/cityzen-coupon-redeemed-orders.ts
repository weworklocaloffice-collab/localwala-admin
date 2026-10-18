import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenCustomerLimitedDetailInterface } from 'src/app/interfaces/cityzen.customer.limited.detail.interface';
import { CityzenOrdersListInterface } from 'src/app/interfaces/cityzen.order.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CityzenRestaurantLimitedDetailForCouponInfoInterface } from 'src/app/interfaces/cityzen.restaurant.limited.detail.for.coupon.info.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-coupon-redeemed-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-coupon-redeemed-orders.html',
})
export class CityzenCouponRedeemedOrders {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<CityzenOrdersListInterface>([]);
  displayedColumn = ['id', 'date', 'customer', 'restaurant', 'amount', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  id: string = '';
  name: string = '';
  city: string = '';
  couponType: string = 'default';
  allRestaurants: boolean = false;
  allUsers: boolean = false;
  code: string = '';
  date: string = '';
  discountType: string = '';
  restaurants: CityzenRestaurantLimitedDetailForCouponInfoInterface[] = [];
  users: CityzenCustomerLimitedDetailInterface[] = [];
  limitSameUser: number = 0;
  loyalityPoints: number = 0;
  maxDiscount: number = 0;
  minCartTotal: number = 0;
  minDiscount: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.id != '') {
      this.getDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getDetail() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/coupon_detail/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        if (response && response.detail && response.detail.id && response.detail.id != '') {
          const detail = response.detail;
          this.name = detail.name;

          if (response && response.detail && response.detail.translations && Array.isArray(response.detail.translations)) {
            const translation = response.detail.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.name = translation?.value || response.detail.name;
          }

          if (detail && detail.city && detail.city.id && detail.city.id != '') {
            this.city = detail.city.name;

            if (detail && detail.city && detail.city.translations && Array.isArray(detail.city.translations)) {
              const translation = detail.city.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.city = translation?.value || detail.city.name;
            }
          }
          this.couponType = detail.couponType;
          this.allRestaurants = detail.allRestaurants;
          this.allUsers = detail.allUsers;
          this.code = detail.code;
          const locale = this.util.appLocaleName();

          const start = DateTime.fromISO(detail.start).setLocale(locale).toLocaleString(DateTime.DATE_MED);
          const end = DateTime.fromISO(detail.expires).setLocale(locale).toLocaleString(DateTime.DATE_MED);
          this.date = `${start} ${this.util.appTranslate('to')} ${end}`;
          this.discountType = detail.discountType;
          this.limitSameUser = detail.limitSameUser;
          this.loyalityPoints = detail.loyalityPoints;
          this.maxDiscount = detail.maxDiscount;
          this.minCartTotal = detail.minCartTotal;
          this.minDiscount = detail.minDiscount;

          const mappedList = detail.restaurants.map(
            (item: CityzenRestaurantLimitedDetailForCouponInfoInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.restaurants = mappedList;
          this.users = detail.users;

        }
        if (response && response.orderList && response.orderList.orders) {
          const mappedList = response.orderList.orders.map(
            (item: CityzenOrdersListInterface) => {
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
              return item;
            }
          );
          this.orders = new MatTableDataSource<CityzenOrdersListInterface>(mappedList);
          this.paginator.length = response.orderList.totalResults;
          this.paginator.hidePageSize = response.orderList.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onBack() {
    this.location.back();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/redeem_order_list/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.orders) {
          this.orders = response.orders;
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
    const okOrderStatus = ['created', 'accepted', 'preparing'];
    const successOrderStatus = ['delivered', 'ready', 'handover', 'ongoing'];
    const failedOrderStatus = ['cancelled', 'rejected', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okOrderStatus.includes(orderStatus)) {
      return 'primary';
    } else if (successOrderStatus.includes(orderStatus)) {
      return 'success';
    } else if (failedOrderStatus.includes(orderStatus)) {
      return 'error';
    }
    return 'warning';
  }

  onOrderDetailPage(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['cityzen-team/u/order-details', orderId]);
  }

  onOrderPrint(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['cityzen-team/u/order-invoice', orderId]);
  }

  onUserInfo(item: CityzenOrdersListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['cityzen-team/u/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: CityzenOrdersListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurant.id]);
    }
  }

  onCouponRestaurantDetail(item: CityzenRestaurantLimitedDetailForCouponInfoInterface) {
    this.router.navigate(['cityzen-team/u/restaurant-detail', item.id]);
  }

  onCouponCustomerDetail(item: CityzenCustomerLimitedDetailInterface) {
    this.router.navigate(['cityzen-team/u/customer-detail', item.id]);
  }

}
