import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenDiningBookingListInterface } from 'src/app/interfaces/cityzen.dining.booking.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-dining-booking-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-dining-booking-list.html',
})
export class CityzenDiningBookingList implements AfterViewInit {

  @Input() status!: string;
  @Input() name!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  bookings = new MatTableDataSource<CityzenDiningBookingListInterface>([]);
  displayedColumn = ['id', 'date', 'guest', 'booker', 'customer', 'restaurant', 'amount', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    console.log(`${this.status} ${this.name}`);
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'status': this.status,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/dining_booking_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.bookings) {
          const mappedList = response.bookings.map(
            (item: CityzenDiningBookingListInterface) => {
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
          this.bookings = new MatTableDataSource<CityzenDiningBookingListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        console.log(this.bookings);
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
    this.router.navigate(['cityzen-team/u/dining-booking-details', bookingId]);
  }

  onUserInfo(item: CityzenDiningBookingListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['cityzen-team/u/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantDetail(item: CityzenDiningBookingListInterface) {
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
