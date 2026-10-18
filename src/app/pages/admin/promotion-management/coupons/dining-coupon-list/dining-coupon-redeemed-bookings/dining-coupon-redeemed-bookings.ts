import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminCustomerLimitedDetailInterface } from 'src/app/interfaces/admin.customer.limited.detail.interface';
import { AdminDiningBookingListInterface } from 'src/app/interfaces/admin.dining.booking.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AdminRestaurantLimitedDetailForCouponInfoInterface } from 'src/app/interfaces/admin.restaurant.limited.detail.for.coupon.info.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dining-coupon-redeemed-bookings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dining-coupon-redeemed-bookings.html',
})
export class DiningCouponRedeemedBookings {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  bookings = new MatTableDataSource<AdminDiningBookingListInterface>([]);
  displayedColumn = ['id', 'date', 'guest', 'booker', 'customer', 'restaurant', 'amount', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  id: string = '';
  name: string = '';
  city: string = '';
  availability: string = 'breakfast';
  allRestaurants: boolean = false;
  allUsers: boolean = false;
  code: string = '';
  date: string = '';
  discountType: string = '';
  restaurants: AdminRestaurantLimitedDetailForCouponInfoInterface[] = [];
  users: AdminCustomerLimitedDetailInterface[] = [];
  limitSameUser: number = 0;
  loyalityPoints: number = 0;
  maxDiscount: number = 0;
  preBookingChargeAmount: number = 0;
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
    this.api.get_private('v1/admin/dining_coupon/detail/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.isLoaded = true;
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
          this.availability = detail.availability;
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
          this.preBookingChargeAmount = detail.preBookingChargeAmount;
          this.minDiscount = detail.minDiscount;

          const mappedList = detail.restaurants.map(
            (item: AdminRestaurantLimitedDetailForCouponInfoInterface) => {
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

        if (response && response.bookings && response.bookings.bookings) {
          const mappedList = response.bookings.bookings.map(
            (item: AdminDiningBookingListInterface) => {
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
          this.bookings = new MatTableDataSource<AdminDiningBookingListInterface>(mappedList);
          this.paginator.length = response.bookings.totalResults;
          this.paginator.hidePageSize = response.bookings.totalResults <= 0 ? true : false;
        }
        console.log(this.bookings);
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
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
    this.api.get_private('v1/admin/dining_booking/coupon/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.bookings) {
          this.bookings = response.bookings;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        console.log(this.bookings);
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

  getStatusColor(bookingStatus: string) {
    const okBookingStatus = ['created', 'accepted', 'preparing'];
    const successBookingStatus = ['completed'];
    const failedBookingStatus = ['cancelled', 'rejected', 'refunded', 'partially_refunded', 'pending_payments'];
    if (okBookingStatus.includes(bookingStatus)) {
      return 'primary';
    } else if (successBookingStatus.includes(bookingStatus)) {
      return 'success';
    } else if (failedBookingStatus.includes(bookingStatus)) {
      return 'error';
    }
    return 'warning';
  }


  onBookingDetailPage(bookingId: string) {
    console.log(`Booking Id -> ${bookingId}`);
    this.router.navigate(['admin/order-management/dining-booking-details', bookingId]);
  }

  onUserInfo(item: AdminDiningBookingListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }


  onRestaurantDetail(item: AdminDiningBookingListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

  onCouponRestaurantDetail(item: AdminRestaurantLimitedDetailForCouponInfoInterface) {
    this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
  }

  onCouponCustomerDetail(item: AdminCustomerLimitedDetailInterface) {
    this.router.navigate(['admin/customer-management/customer-detail', item.id]);
  }

}
