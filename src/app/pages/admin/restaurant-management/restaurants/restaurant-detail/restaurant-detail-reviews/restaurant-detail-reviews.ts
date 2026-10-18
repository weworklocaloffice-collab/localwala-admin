import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminVendorFoodReviewListInterface, HashtagFood } from 'src/app/interfaces/admin.vendor.food.review.list.interface';
import { AdminVendorOrderReviewListInterface, HashtagOrder } from 'src/app/interfaces/admin.vendor.order.review.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-restaurant-detail-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './restaurant-detail-reviews.html',
})
export class RestaurantDetailReviews implements AfterViewInit {

  @Input() restaurantId!: string;
  @ViewChild('restaurantReviewPaginator', { read: MatPaginator, static: false }) restaurantReviewPaginator: MatPaginator;
  @ViewChild('foodReviewPaginator', { read: MatPaginator, static: false }) foodReviewPaginator: MatPaginator;
  restaurantReview: AdminVendorOrderReviewListInterface[] = [];
  foodReview: AdminVendorFoodReviewListInterface[] = [];
  pageSizeRestaurant: number = 5;
  currentPageRestaurant: number = 0;
  restaurantTotalReview: number = 0;
  isLoadedRestaurant: boolean = false;
  pageSizeFood: number = 5;
  currentPageFood: number = 0;
  foodTotalReview: number = 0;
  isLoadedFood: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {

  }

  ngAfterViewInit() {
    console.log(`------ ${this.restaurantId}`);
    this.getInitial();
  }

  getInitial() {
    this.isLoadedRestaurant = false;
    this.isLoadedFood = false;
    const param: any = {
      'limit': this.pageSizeRestaurant,
      'page': this.currentPageRestaurant,
      'restaurant': this.restaurantId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/vendor_detail/all_reviews?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurant = true;
        this.isLoadedFood = true;
        if (response && response.food && response.food.foodReviews) {
          const mappedList = response.food.foodReviews.map(
            (item: AdminVendorFoodReviewListInterface) => {
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

        if (response && response.restaurant && response.restaurant.restaurantReviews) {
          this.restaurantReview = response.restaurant.restaurantReviews;
          this.restaurantTotalReview = response.restaurant.totalResultsRestaurant;
          this.restaurantReviewPaginator.length = response.restaurant.totalResultsRestaurant;
          this.restaurantReviewPaginator.hidePageSize = response.restaurant.totalResultsRestaurant <= 0 ? true : false;
        }

      }, error: (error: any) => {
        console.log(error);
        this.isLoadedRestaurant = true;
        this.isLoadedFood = true;
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
      'restaurant': this.restaurantId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/vendor_detail/vendor_food_reviews?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedFood = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AdminVendorFoodReviewListInterface) => {
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
      'restaurant': this.restaurantId,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/vendor_detail/vendor_reviews?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoadedRestaurant = true;
        if (response && response.results) {
          this.restaurantReview = response.results;
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

  onOrderDetail(id: string) {
    this.router.navigate(['admin/order-management/order-details', id]);
  }

  onFoodDetail(id: string) {
    this.router.navigate(['admin/foods/food-detail', id]);
  }

  onUserDetail(id: string) {
    this.router.navigate(['admin/customer-management/customer-detail', id]);
  }

  getTranslatedFoodHashtag(hash: HashtagFood): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

  getTranslatedRestaurantHashtag(hash: HashtagOrder): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

}
