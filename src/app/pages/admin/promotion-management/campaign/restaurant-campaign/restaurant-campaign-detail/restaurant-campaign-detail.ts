import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminRestaurantListInterface } from 'src/app/interfaces/admin.restaurant.list.interface';
import { OrdersListInterface } from 'src/app/interfaces/orders.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-restaurant-campaign-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './restaurant-campaign-detail.html',
})
export class RestaurantCampaignDetail {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<OrdersListInterface>([]);
  displayedColumnOrders = ['id', 'date', 'customer', 'restaurant', 'amount', 'status', 'action'];
  restaurants = new MatTableDataSource<AdminRestaurantListInterface>([]);
  displayedColumnRestaurant = ['name', 'owner', 'location', 'cuisine', 'action'];
  id: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  title: string = '';
  shortDescription: string = '';
  city: string = '';
  image: string = '';
  date: string = '';
  time: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.id != '') {
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }


  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant_campaign/detail/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          if (response && response.detail) {
            const detail = response.detail;
            this.title = detail.title;
            this.shortDescription = detail.shortDescription;
            this.image = detail.image;

            if (response && response.detail && response.detail.translations && Array.isArray(response.detail.translations)) {
              const translation = response.detail.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.title = translation?.title || response.detail.name;
              this.shortDescription = translation?.shortDescription || response.detail.shortDescription;
            }

            if (detail && detail.city && detail.city.id != '') {
              this.city = detail.city.name;

              if (detail && detail.city && detail.city.translations && Array.isArray(detail.city.translations)) {
                const translation = detail.city.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.city = translation?.value || detail.city.name;
              }
            }

            const startDate = DateTime.fromJSDate(new Date(detail.startDate)).setLocale(this.util.appLocaleName()).toFormat('DD');
            const endDate = DateTime.fromJSDate(new Date(detail.endDate)).setLocale(this.util.appLocaleName()).toFormat('DD');
            const startTime = DateTime.fromFormat(detail.startTime, 'HH:mm', { locale: this.util.appLocaleName() }).toFormat('hh:mm a');
            const endTime = DateTime.fromFormat(detail.endTime, 'HH:mm', { locale: this.util.appLocaleName() }).toFormat('hh:mm a');
            this.date = `${startDate} ${this.util.appTranslate('to')} ${endDate}`;
            this.time = `${startTime} ${this.util.appTranslate('to')} ${endTime}`;
          }
          const mappedRestaurants = response.restaurants.map(
            (item: AdminRestaurantListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              if (item && item.city && item.city?.id) {
                if (item.city?.translations) {
                  const translation = item.city.translations.find((t) => t.code == this.util.appLocaleName());
                  item.city.displayName = translation?.value || item.city.name;
                } else {
                  item.city.displayName = item.city?.name || '';
                }
              }
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }
              item.cuisine?.map((cuisineItem) => {
                if (cuisineItem?.translations) {
                  const translation = cuisineItem.translations.find((t) => t.code == this.util.appLocaleName());
                  cuisineItem.displayName = translation?.value || cuisineItem.name;
                } else {
                  cuisineItem.displayName = cuisineItem?.name || '';
                }
              });
              return item;
            }
          );
          this.restaurants = new MatTableDataSource<AdminRestaurantListInterface>(mappedRestaurants);

          const mappedOrdersList = response.orders.map(
            (item: OrdersListInterface) => {
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
          this.orders = new MatTableDataSource<OrdersListInterface>(mappedOrdersList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;

        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getInfo();
  }

  onBack() {
    this.location.back();
  }

  onRestaurantDetail(item: AdminRestaurantListInterface) {
    console.log(item);
    this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
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

  onUserInfo(item: OrdersListInterface) {
    console.log(item);
    if (item && item.userInfo && item.userInfo.id && item.userInfo.id != '') {
      this.router.navigate(['admin/customer-management/customer-detail', item.userInfo.id]);
    }
  }

  onOrderRestaurantDetail(item: OrdersListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.restaurant.id]);
    }
  }

}
