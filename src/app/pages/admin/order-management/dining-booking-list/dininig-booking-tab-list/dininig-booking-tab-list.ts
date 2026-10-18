import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminDiningBookingListInterface } from 'src/app/interfaces/admin.dining.booking.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dininig-booking-tab-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dininig-booking-tab-list.html',
})
export class DininigBookingTabList implements AfterViewInit {

  @Input() status!: string;
  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  bookings = new MatTableDataSource<AdminDiningBookingListInterface>([]);
  displayedColumn = ['id', 'date', 'guest', 'booker', 'customer', 'restaurant', 'amount', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.status}`);
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
    this.api.get_private('v1/admin/dining_booking/getDiningBookingList?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.bookings) {
          const mappedList = response.bookings.map(
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

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'status': this.status,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/dining_booking/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'DiningBooking.xlsx' : 'DiningBooking.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'diningbookings.json';
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
    this.router.navigate(['admin/import-export-management/import-collection/', 'dining_booking']);
  }

  getName(): string {
    if (this.status == 'all') {
      return this.util.appTranslate('all_bookings');
    } else if (this.status == 'created') {
      return this.util.appTranslate('new_bookings');
    } else if (this.status == 'accepted') {
      return this.util.appTranslate('accepted_bookings');
    } else if (this.status == 'completed') {
      return this.util.appTranslate('completed_bookings');
    } else if (this.status == 'cancelled') {
      return this.util.appTranslate('cancelled_bookings');
    } else if (this.status == 'rejected') {
      return this.util.appTranslate('rejected_bookings');
    } else if (this.status == 'refunded') {
      return this.util.appTranslate('refunded_bookings');
    } else if (this.status == 'partially_refunded') {
      return this.util.appTranslate('partially_refunded_bookings');
    } else if (this.status == 'pending_payments') {
      return this.util.appTranslate('pending_bookings');
    }
    return this.util.appTranslate('all_bookings');
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
