import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { AdminFoodDetailReviewInterface, Hashtag } from 'src/app/interfaces/admin.food.detail.review.interface';
import { AdminFoodDetailTaxationInterface } from 'src/app/interfaces/admin.food.detail.taxation.interface';
import { AdminFoodDetailVariationInterface } from 'src/app/interfaces/admin.food.detail.variation.interface';
import { ReviewPercentageInterface } from 'src/app/interfaces/review.percentage.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-admin-food-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './admin-food-details.html',
})
export class AdminFoodDetails {

  @ViewChild('foodReviewPaginator', { read: MatPaginator, static: false }) foodReviewPaginator: MatPaginator;
  foodReview: AdminFoodDetailReviewInterface[] = [];
  reviews = new MatTableDataSource<ReviewPercentageInterface>([]);
  displayedReviewsColumns: string[] = ['progress', 'number'];
  id: string = '';
  name: string = '';
  image: string = '';
  shortDescription: string = '';
  category: string = '';
  subCategory: string = '';
  price: number = 0;
  discount: number = 0;
  discountType: string = '%';
  purchaseLimit: string = '';
  rating: number = 0;
  totalRating: number = 0;
  startTime: string = '';
  endTime: string = '';
  foodType: string = '';
  stockNumber: string = '';
  stockType: string = '';
  tags: string[] = [];
  restaurantId: string = '';
  restaurantName: string = '';
  restaurantLogo: string = '';
  restaurantAddress: string = '';
  addons: string = '';
  variation = new MatTableDataSource<AdminFoodDetailVariationInterface>([]);
  displayedVariationColumns: string[] = ['title', 'options'];
  taxation: AdminFoodDetailTaxationInterface[] = [];
  displayedTaxationColumns: string[] = ['taxation'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.id != null && this.id != '') {
      this.getDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getDetail() {
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.isLoaded = false;
    this.api.get_private('v1/admin/foods/detail/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success == true) {
          const detail = response.detail;
          this.name = detail.name;
          this.image = detail.image;
          this.shortDescription = detail.shortDescription;

          if (response && response.detail && response.detail?.translations && Array.isArray(response.detail?.translations)) {
            const translation = response.detail.translations.find((t: any) => t.code == this.util.appLocaleName());
            this.name = translation?.title || response.detail.name;
            this.shortDescription = translation?.shortDescription || response.detail.shortDescription;
          }

          if (detail && detail.ownCategory && detail.ownCategory == true) {
            if (detail && detail.customCategory && detail.customCategory.id != '') {
              this.category = detail.customCategory.name;

              if (detail && detail.customCategory && detail.customCategory?.translations && Array.isArray(detail.customCategory?.translations)) {
                const translation = detail.customCategory.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.category = translation?.value || detail.customCategory.name;
              }

            }
            if (detail && detail.customSubCategory && detail.customSubCategory.id != '') {
              this.subCategory = detail.customSubCategory.name;
              if (detail && detail.customSubCategory && detail.customSubCategory?.translations && Array.isArray(detail.customSubCategory?.translations)) {
                const translation = detail.customSubCategory.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.subCategory = translation?.value || detail.customSubCategory.name;
              }
            }
          } else {
            if (detail && detail.category && detail.category.id != '') {
              this.category = detail.category.name;
              if (detail && detail.category && detail.category?.translations && Array.isArray(detail.category?.translations)) {
                const translation = detail.category.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.category = translation?.value || detail.category.name;
              }
            }
            if (detail && detail.subCategory && detail.subCategory.id != '') {
              this.subCategory = detail.subCategory.name;
              if (detail && detail.subCategory && detail.subCategory?.translations && Array.isArray(detail.subCategory?.translations)) {
                const translation = detail.subCategory.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.subCategory = translation?.value || detail.subCategory.name;
              }
            }
          }

          this.price = detail.price;
          this.discount = detail.discount;
          this.discountType = detail.discountType;
          this.purchaseLimit = detail.purchaseLimit == -1 ? this.util.appTranslate('unlimited') : detail.purchaseLimit;
          this.rating = detail.rating;
          this.totalRating = detail.totalRating;
          if (detail && detail.startTime != '') {
            this.startTime = DateTime.fromFormat(detail.startTime, 'HH:mm').setLocale(this.util.appLocaleName()).toFormat('hh:mm a');
          }
          if (detail && detail.endTime != '') {
            this.startTime = DateTime.fromFormat(detail.endTime, 'HH:mm').setLocale(this.util.appLocaleName()).toFormat('hh:mm a');
          }
          this.foodType = detail.foodType;
          this.stockNumber = detail.stockNumber == -1 ? this.util.appTranslate('unlimited') : detail.stockNumber;
          this.stockType = detail.stockType;
          if (detail && detail.tags && detail.tags.length > 0) {
            this.tags = detail.tags.join(', ');
          }

          if (detail && detail.restaurants && detail.restaurants.id != '') {
            const restaurant = detail.restaurants;
            this.restaurantId = restaurant.id;
            this.restaurantName = restaurant.name;
            this.restaurantLogo = restaurant.logo;
            this.restaurantAddress = restaurant.address;

            if (detail && detail.restaurants && detail.restaurants.translations && Array.isArray(detail.restaurants.translations)) {
              const translation = detail.restaurants.translations.find((t: any) => t.code == this.util.appLocaleName());
              this.restaurantName = translation?.title || detail.restaurants.name;
              this.restaurantAddress = translation?.address || detail.restaurants.address;
            }
          }

          if (detail && detail.addons && detail.addons.length > 0) {
            const nameList: string[] = [];
            detail.addons.forEach((element: any) => {
              let name = element.name;
              if (element && element?.translations && Array.isArray(element?.translations)) {
                const translation = element.translations.find((t: any) => t.code == this.util.appLocaleName());
                name = translation?.value || element.name;
              }
              nameList.push(name);
            });
            this.addons = nameList.join(', ');
          } else {
            this.addons = '';
          }

          if (detail && detail.variations && detail.variations.length > 0) {
            this.variation = detail.variations;
          }

          if (detail && detail.foodtaxations && detail.foodtaxations.length) {
            const mappedList = detail.foodtaxations.map(
              (item: AdminFoodDetailTaxationInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.title || item.taxName;
                } else {
                  item.displayName = item?.taxName || '';
                }
                return item;
              }
            );
            this.taxation = mappedList;
          } else {
            this.taxation = [];
          }

          this.reviews = response.percentages;

          if (response && response.reviews) {
            this.foodReview = response.reviews;
            this.foodReviewPaginator.length = response.totalResults;
            this.foodReviewPaginator.hidePageSize = response.totalResults <= 0 ? true : false;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
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
    this.getDetail();
  }

  onRestaurantInfo() {
    this.router.navigate(['admin/restaurant-management/restaurant-detail', this.restaurantId]);
  }

  onUserDetail(id: string) {
    this.router.navigate(['admin/customer-management/customer-detail', id]);
  }

  onOrderDetail(id: string) {
    this.router.navigate(['admin/order-management/order-details', id]);
  }

  getTranslatedFoodHashtag(hash: Hashtag): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

}
