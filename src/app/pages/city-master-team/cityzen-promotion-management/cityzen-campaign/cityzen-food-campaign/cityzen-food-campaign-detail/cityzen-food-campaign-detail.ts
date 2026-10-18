import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenFoodListInterface } from 'src/app/interfaces/cityzen.food.list.interface';
import { CityzenOrdersListInterface } from 'src/app/interfaces/cityzen.order.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-food-campaign-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-food-campaign-detail.html',
})
export class CityzenFoodCampaignDetail {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  orders = new MatTableDataSource<CityzenOrdersListInterface>([]);
  displayedColumnOrders = ['id', 'date', 'customer', 'restaurant', 'amount', 'status', 'action'];
  foods = new MatTableDataSource<CityzenFoodListInterface>([]);
  displayedColumnFoods = ['name', 'category', 'restaurant', 'price', 'action'];
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
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/food_campaign_detail/' + this.id + '?' + httpParams.toString()).subscribe({
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
          const mappedList = response.foods.map(
            (item: CityzenFoodListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

              if (item && item.category && item.category?.id) {
                if (item.category?.translations) {
                  const translation = item.category.translations.find((t) => t.code == this.util.appLocaleName());
                  item.category.displayName = translation?.value || item.category.name;
                } else {
                  item.category.displayName = item.category?.name || '';
                }
              }

              if (item && item.subCategory && item.subCategory?.id) {
                if (item.subCategory?.translations) {
                  const translation = item.subCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.subCategory.displayName = translation?.value || item.subCategory.name;
                } else {
                  item.subCategory.displayName = item.subCategory?.name || '';
                }
              }

              if (item && item.customCategory && item.customCategory?.id) {
                if (item.customCategory?.translations) {
                  const translation = item.customCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.customCategory.displayName = translation?.value || item.customCategory.name;
                } else {
                  item.customCategory.displayName = item.customCategory?.name || '';
                }
              }

              if (item && item.customSubCategory && item.customSubCategory?.id) {
                if (item.customSubCategory?.translations) {
                  const translation = item.customSubCategory.translations.find((t) => t.code == this.util.appLocaleName());
                  item.customSubCategory.displayName = translation?.value || item.customSubCategory.name;
                } else {
                  item.customSubCategory.displayName = item.customSubCategory?.name || '';
                }
              }

              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                }
              }
              return item;
            }
          );
          this.foods = new MatTableDataSource<CityzenFoodListInterface>(mappedList);

          const ordersMappedList = response.orders.map(
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
          this.orders = new MatTableDataSource<CityzenOrdersListInterface>(ordersMappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onBack() {
    this.location.back();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getInfo();
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

  onOrderRestaurantDetail(item: CityzenOrdersListInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurant.id]);
    }
  }

  onFoodRestaurantDetail(item: CityzenFoodListInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurants.id]);
    }
  }

  onFoodDetail(food: CityzenFoodListInterface) {
    this.router.navigate(['cityzen-team/u/food-detail', food.id]);
  }

}
