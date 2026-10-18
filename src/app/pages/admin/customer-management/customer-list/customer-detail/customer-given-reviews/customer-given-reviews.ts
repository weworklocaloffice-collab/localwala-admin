import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { AdminCustomerDeliverymanReviewInterface, HashtagDeliveryman } from 'src/app/interfaces/admin.customer.deliveryman.review.interface';
import { AdminCustomerFoodReviewInterface, HashtagFood } from 'src/app/interfaces/admin.customer.food.review.interface';
import { AdminCustomerRestaurantReviewInterface, HashtagRestaurant } from 'src/app/interfaces/admin.customer.restaurant.review.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-customer-given-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './customer-given-reviews.html',
})
export class CustomerGivenReviews implements AfterViewInit {

  @Input() userId!: string;
  @ViewChild('deliverymanReviewPaginator', { read: MatPaginator, static: false }) deliverymanReviewPaginator: MatPaginator;
  @ViewChild('restaurantReviewPaginator', { read: MatPaginator, static: false }) restaurantReviewPaginator: MatPaginator;
  @ViewChild('foodReviewPaginator', { read: MatPaginator, static: false }) foodReviewPaginator: MatPaginator;
  deliverymanReview: AdminCustomerDeliverymanReviewInterface[] = [];
  restaurantReview: AdminCustomerRestaurantReviewInterface[] = [];
  foodReview: AdminCustomerFoodReviewInterface[] = [];
  pageSizeRestaurant: number = 5;
  currentPageRestaurant: number = 0;
  restaurantTotalReview: number = 0;
  isLoadedRestaurant: boolean = false;
  pageSizeFood: number = 5;
  currentPageFood: number = 0;
  foodTotalReview: number = 0;
  isLoadedFood: boolean = false;
  pageSizeDeliveryman: number = 5;
  currentPageDeliveryman: number = 0;
  deliverymanTotalReview: number = 0;
  isLoadedDeliveryman: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.userId}`);
    this.getInitial();
  }

  getInitial() {
    this.isLoadedRestaurant = false;
    this.isLoadedFood = false;
    this.isLoadedDeliveryman = false;
    const param: any = {
      'limit': this.pageSizeRestaurant,
      'page': this.currentPageRestaurant,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerAllReviews?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurant = true;
        this.isLoadedFood = true;
        this.isLoadedDeliveryman = true;
        if (response && response.food && response.food.foodReviews) {
          const mappedList = response.food.foodReviews.map(
            (item: AdminCustomerFoodReviewInterface) => {
              if (item && item.foods && item.foods?.id) {
                if (item.foods?.translations) {
                  const translation = item.foods.translations.find((t) => t.code == this.util.appLocaleName());
                  item.foods.displayName = translation?.title || item.foods.name;
                } else {
                  item.foods.displayName = item.foods?.name || '';
                }
              }
              return item;
            }
          );
          this.foodReview = mappedList;
          this.foodTotalReview = response.food.totalResultsFood;
          this.foodReviewPaginator.length = response.food.totalResultsFood;
          this.foodReviewPaginator.hidePageSize = response.food.totalResultsFood <= 0 ? true : false;
        }

        if (response && response.deliveryman && response.deliveryman.deliverymanReviews) {
          this.deliverymanReview = response.deliveryman.deliverymanReviews;
          this.deliverymanTotalReview = response.deliveryman.totalResultsDeliveryman;
          this.deliverymanReviewPaginator.length = response.deliveryman.totalResultsDeliveryman;
          this.deliverymanReviewPaginator.hidePageSize = response.deliveryman.totalResultsDeliveryman <= 0 ? true : false;
        }

        if (response && response.restaurant && response.restaurant.restaurantReviews) {
          const mappedList = response.restaurant.restaurantReviews.map(
            (item: AdminCustomerRestaurantReviewInterface) => {
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                  item.restaurants.displayAddress = translation?.address || item.restaurants.address;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                  item.restaurants.displayAddress = item.restaurants?.address || '';
                }
              }
              return item;
            }
          );
          this.restaurantReview = mappedList;
          this.restaurantTotalReview = response.restaurant.totalResultsRestaurant;
          this.restaurantReviewPaginator.length = response.restaurant.totalResultsRestaurant;
          this.restaurantReviewPaginator.hidePageSize = response.restaurant.totalResultsRestaurant <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isLoadedRestaurant = true;
        this.isLoadedFood = true;
        this.isLoadedDeliveryman = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  getFoodReview() {
    this.isLoadedFood = false;
    const param: any = {
      'limit': this.pageSizeFood,
      'page': this.currentPageFood,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerFoodReview?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedFood = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerFoodReviewInterface) => {
              if (item && item.foods && item.foods?.id) {
                if (item.foods?.translations) {
                  const translation = item.foods.translations.find((t) => t.code == this.util.appLocaleName());
                  item.foods.displayName = translation?.title || item.foods.name;
                } else {
                  item.foods.displayName = item.foods?.name || '';
                }
              }
              return item;
            }
          );
          this.foodReview = mappedList;
          this.foodReviewPaginator.length = response.totalResults;
          this.foodReviewPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedFood = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onFoodPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageFood = event.pageIndex + 1;
    this.pageSizeFood = event.pageSize;
    this.getFoodReview();
  }

  getRestaurantReview() {
    this.isLoadedRestaurant = false;
    const param: any = {
      'limit': this.pageSizeRestaurant,
      'page': this.currentPageRestaurant,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerRestaurantReview?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurant = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminCustomerRestaurantReviewInterface) => {
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation?.title || item.restaurants.name;
                  item.restaurants.displayAddress = translation?.address || item.restaurants.address;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                  item.restaurants.displayAddress = item.restaurants?.address || '';
                }
              }
              return item;
            }
          );
          this.restaurantReview = mappedList;
          this.restaurantReviewPaginator.length = response.totalResults;
          this.restaurantReviewPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
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
    this.getRestaurantReview();
  }

  getDeliverymanReview() {
    this.isLoadedDeliveryman = false;
    const param: any = {
      'limit': this.pageSizeDeliveryman,
      'page': this.currentPageDeliveryman,
      'user': this.userId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/customer/customerDeliverymanReview?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedDeliveryman = true;
        if (response && response.results) {
          this.deliverymanReview = response.results;
          this.deliverymanReviewPaginator.length = response.totalResults;
          this.deliverymanReviewPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoadedDeliveryman = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onDeliverymanPageChange(event: PageEvent) {
    console.log(event);
    this.currentPageDeliveryman = event.pageIndex + 1;
    this.pageSizeDeliveryman = event.pageSize;
    this.getDeliverymanReview();
  }

  getTranslatedDeliverymanHashtag(hash: HashtagDeliveryman): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

  getTranslatedFoodHashtag(hash: HashtagFood): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

  getTranslatedRestaurantHashtag(hash: HashtagRestaurant): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

}
