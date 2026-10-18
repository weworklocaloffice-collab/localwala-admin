import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminDeliverymanOrderComplaintInterface } from 'src/app/interfaces/admin.deliveryman.order.complaint.interface';
import { AdminDeliverymanRestaurantComplaintInterface } from 'src/app/interfaces/admin.deliveryman.restaurant.complaint.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-driver-details-complaints',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './driver-details-complaints.html',
})
export class DriverDetailsComplaints implements AfterViewInit {

  @Input() driverId!: string;
  @ViewChild('userComplaintPaginator', { read: MatPaginator, static: false }) userComplaintPaginator: MatPaginator;
  @ViewChild('restaurantComplaintPaginator', { read: MatPaginator, static: false }) restaurantComplaintPaginator: MatPaginator;
  userComplaintList = new MatTableDataSource<AdminDeliverymanOrderComplaintInterface>([]);
  restaurantComplaintList = new MatTableDataSource<AdminDeliverymanRestaurantComplaintInterface>([]);
  displayedColumnUser = ['id', 'user', 'order', 'reason', 'detail', 'status'];
  displayedColumnRestaurant = ['id', 'order', 'reason', 'detail', 'status'];
  pageSizeUser: number = 5;
  currentPageUser: number = 0;
  isLoadedUser: boolean = false;
  pageSizeRestaurant: number = 5;
  currentPageRestaurant: number = 0;
  isLoadedRestaurant: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.driverId}`);
    this.getInitial();
  }

  getInitial() {
    this.isLoadedUser = false;
    this.isLoadedRestaurant = false;
    const param: any = {
      'limit': this.pageSizeUser,
      'page': this.currentPageUser,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/deliveryman_detail/complaints?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedUser = true;
        this.isLoadedRestaurant = true;
        if (response && response.order && response.order.orderComplaint) {
          const mappedList = response.order.orderComplaint.map(
            (item: AdminDeliverymanOrderComplaintInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.userComplaintList = new MatTableDataSource<AdminDeliverymanOrderComplaintInterface>(mappedList);
          this.userComplaintPaginator.length = response.order.totalResultsOrder;
          this.userComplaintPaginator.hidePageSize = response.order.totalResultsOrder <= 0 ? true : false;
        }

        if (response && response.restaurant && response.restaurant.restaurantComplaint) {
          const mappedList = response.restaurant.restaurantComplaint.map(
            (item: AdminDeliverymanRestaurantComplaintInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.restaurantComplaintList = new MatTableDataSource<AdminDeliverymanRestaurantComplaintInterface>(mappedList);
          this.restaurantComplaintPaginator.length = response.restaurant.totalResultsRestaurant;
          this.restaurantComplaintPaginator.hidePageSize = response.restaurant.totalResultsRestaurant <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedUser = true;
        this.isLoadedRestaurant = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getUserComplaint() {
    this.isLoadedUser = false;
    const param: any = {
      'limit': this.pageSizeUser,
      'page': this.currentPageUser,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/deliveryman_detail/complaint_orders?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedUser = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDeliverymanOrderComplaintInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.userComplaintList = new MatTableDataSource<AdminDeliverymanOrderComplaintInterface>(mappedList);
          this.userComplaintPaginator.length = response.totalResults;
          this.userComplaintPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedUser = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUserPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageUser = event.pageIndex + 1;
    this.pageSizeUser = event.pageSize;
    this.getUserComplaint();
  }

  getRestaurantComplaint() {
    this.isLoadedRestaurant = false;
    const param: any = {
      'limit': this.pageSizeRestaurant,
      'page': this.currentPageRestaurant,
      'deliveryman': this.driverId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/deliveryman_detail/complaint_vendor?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurant = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminDeliverymanRestaurantComplaintInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }
              return item;
            }
          );
          this.restaurantComplaintList = new MatTableDataSource<AdminDeliverymanRestaurantComplaintInterface>(mappedList);
          this.restaurantComplaintPaginator.length = response.totalResults;
          this.restaurantComplaintPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedRestaurant = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onRestaurantPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageRestaurant = event.pageIndex + 1;
    this.pageSizeRestaurant = event.pageSize;
    this.getRestaurantComplaint();
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onUserComplaintInfo(item: AdminDeliverymanOrderComplaintInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onUserOrderInfo(item: AdminDeliverymanOrderComplaintInterface) {
    console.log(item);
    if (item && item.orderInfo && item.orderInfo.id && item.orderInfo.id != '') {
      this.router.navigate(['admin/order-management/order-details', item.orderInfo.id]);
    }
  }

  onRestaurantUserInfo(item: AdminDeliverymanRestaurantComplaintInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onRestaurantOrderInfo(item: AdminDeliverymanRestaurantComplaintInterface) {
    console.log(item);
    if (item && item.orderInfo && item.orderInfo.id && item.orderInfo.id != '') {
      this.router.navigate(['admin/order-management/order-details', item.orderInfo.id]);
    }
  }

}
