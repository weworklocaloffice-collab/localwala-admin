import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminCustomerFavouriteFoodInterface } from 'src/app/interfaces/admin.customer.favourite.food.interface';
import { AdminCustomerFavouriteRestaurantInterface } from 'src/app/interfaces/admin.customer.favourite.restaurant.interface';
import { AdminCustomerOrderListInterface } from 'src/app/interfaces/admin.customer.order.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-customer-favourite-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './customer-favourite-list.html',
})
export class CustomerFavouriteList implements AfterViewInit {

  @Input() userId!: string;
  @ViewChild('favouriteOrderPaginator', { read: MatPaginator, static: false }) favouriteOrderPaginator: MatPaginator;
  @ViewChild('favouriteRestaurantPaginator', { read: MatPaginator, static: false }) favouriteRestaurantPaginator: MatPaginator;
  @ViewChild('favouriteFoodPaginator', { read: MatPaginator, static: false }) favouriteFoodPaginator: MatPaginator;
  favouriteRestaurants = new MatTableDataSource<AdminCustomerFavouriteRestaurantInterface>([]);
  favouriteFoods = new MatTableDataSource<AdminCustomerFavouriteFoodInterface>([]);
  favouriteOrders = new MatTableDataSource<AdminCustomerOrderListInterface>([]);
  displayedOrderColumn = ['id', 'date', 'restaurant', 'amount', 'status', 'action'];
  displayedRestaurantColumn = ['restaurant', 'orders', 'date'];
  displayedFoodsColumn = ['food', 'orders', 'date'];
  pageSizeRestaurants: number = 5;
  currentPageRestaurants: number = 0;
  isLoadedRestaurants: boolean = false;
  pageSizeFoods: number = 5;
  currentPageFoods = 0;
  isLoadedFoods: boolean = false;
  pageSizeOrders: number = 5;
  currentPageOrders: number = 0;
  isLoadedOrders: boolean = false;

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
    this.isLoadedRestaurants = false;
    this.isLoadedFoods = false;
    const param: any = {
      'limit': this.pageSizeOrders,
      'page': this.currentPageOrders,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerAllFavourite?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedOrders = true;
        this.isLoadedRestaurants = true;
        this.isLoadedFoods = true;
        if (response && response.order && response.order.favouriteOrders) {
          const mappedList = response.order.favouriteOrders.map(
            (item: AdminCustomerOrderListInterface) => {
              if (item && item.restaurant && item.restaurant.id) {
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
          this.favouriteOrders = new MatTableDataSource<AdminCustomerOrderListInterface>(mappedList);
          this.favouriteOrderPaginator.length = response.order.totalResultsOrder;
          this.favouriteOrderPaginator.hidePageSize = response.order.totalResultsOrder <= 0 ? true : false;
        }

        if (response && response.restaurant && response.restaurant.restaurantFavourite) {
          const mappedList = response.restaurant.restaurantFavourite.map(
            (item: AdminCustomerFavouriteRestaurantInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                  item.restaurant.displayAddress = translation?.address || item.restaurant.address;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                  item.restaurant.displayAddress = item.restaurant?.address || '';
                }
              }
              return item;
            }
          );
          this.favouriteRestaurants = new MatTableDataSource<AdminCustomerFavouriteRestaurantInterface>(mappedList);
          this.favouriteRestaurantPaginator.length = response.restaurant.totalResultsRestaurant;
          this.favouriteRestaurantPaginator.hidePageSize = response.restaurant.totalResultsRestaurant <= 0 ? true : false;
        }

        if (response && response.food && response.food.foodFavourite) {

          const mappedList = response.food.foodFavourite.map(
            (item: AdminCustomerFavouriteFoodInterface) => {
              if (item && item.food && item.food?.id) {
                if (item.food?.translations) {
                  const translation = item.food.translations.find((t) => t.code == this.util.appLocaleName());
                  item.food.displayName = translation?.title || item.food.name;
                } else {
                  item.food.displayName = item.food?.name || '';
                }
              }
              return item;
            }
          );
          this.favouriteFoods = new MatTableDataSource<AdminCustomerFavouriteFoodInterface>(mappedList);
          this.favouriteFoodPaginator.length = response.food.totalResultsFood;
          this.favouriteFoodPaginator.hidePageSize = response.food.totalResultsFood <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedOrders = true;
        this.isLoadedRestaurants = true;
        this.isLoadedFoods = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getOrderList() {
    console.log('Order List');
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
    this.api.get_private('v1/admin/customer/customerFavouriteOrders?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedOrders = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerOrderListInterface) => {
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
          this.favouriteOrders = new MatTableDataSource<AdminCustomerOrderListInterface>(mappedList);
          this.favouriteOrderPaginator.length = response.totalResults;
          this.favouriteOrderPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedOrders = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onOrderPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageOrders = event.pageIndex + 1;
    this.pageSizeOrders = event.pageSize;
    this.getOrderList();
  }

  getRestaurantList() {
    console.log('Restaurant List');
    this.isLoadedRestaurants = false;
    const param: any = {
      'limit': this.pageSizeRestaurants,
      'page': this.currentPageRestaurants,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerFavouriteRestaurant?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurants = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerFavouriteRestaurantInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                  item.restaurant.displayAddress = translation?.address || item.restaurant.address;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                  item.restaurant.displayAddress = item.restaurant?.address || '';
                }
              }
              return item;
            }
          );
          this.favouriteRestaurants = new MatTableDataSource<AdminCustomerFavouriteRestaurantInterface>(mappedList);
          this.favouriteRestaurantPaginator.length = response.totalResults;
          this.favouriteRestaurantPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedRestaurants = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onRestaurantPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageRestaurants = event.pageIndex + 1;
    this.pageSizeRestaurants = event.pageSize;
    this.getRestaurantList();
  }


  getFoodList() {
    console.log('Food List');
    this.isLoadedFoods = false;
    const param: any = {
      'limit': this.pageSizeFoods,
      'page': this.currentPageFoods,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerFavouriteFood?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedFoods = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerFavouriteFoodInterface) => {
              if (item && item.food && item.food?.id) {
                if (item.food?.translations) {
                  const translation = item.food.translations.find((t) => t.code == this.util.appLocaleName());
                  item.food.displayName = translation?.title || item.food.name;
                } else {
                  item.food.displayName = item.food?.name || '';
                }
              }
              return item;
            }
          );
          this.favouriteFoods = new MatTableDataSource<AdminCustomerFavouriteFoodInterface>(mappedList);
          this.favouriteFoodPaginator.length = response.totalResults;
          this.favouriteFoodPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedFoods = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onFoodPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageFoods = event.pageIndex + 1;
    this.pageSizeFoods = event.pageSize;
    this.getFoodList();
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
    this.router.navigate(['admin/order-management/order-details', orderId]);
  }

  onOrderPrint(orderId: string) {
    console.log(`Order Id -> ${orderId}`);
    this.router.navigate(['admin/order-management/order-invoice', orderId]);
  }

}
