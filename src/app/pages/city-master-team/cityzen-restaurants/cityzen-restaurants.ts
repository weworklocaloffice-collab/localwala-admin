import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenRestaurantListInterface } from 'src/app/interfaces/cityzen.restaurant.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-restaurants',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-restaurants.html',
})
export class CityzenRestaurants {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<CityzenRestaurantListInterface>([]);
  displayedColumn = ['name', 'owner', 'location', 'cuisine', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/restaurant_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const restaurantMappedList = response.results.map(
            (item: CityzenRestaurantListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              item.cuisine?.map((cusineItem) => {
                if (cusineItem.translations) {
                  const translation = cusineItem.translations.find((t) => t.code == this.util.appLocaleName());
                  cusineItem.displayName = translation?.value || cusineItem.name;
                } else {
                  cusineItem.displayName = cusineItem?.name || '';
                }
              });

              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }

              return item;
            }
          );
          this.restaurants = new MatTableDataSource<CityzenRestaurantListInterface>(restaurantMappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.restaurants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onStatusChange(event: MatSlideToggleChange, restaurants: CityzenRestaurantListInterface) {
    restaurants.status = event.checked;
    this.api.patch_private('v1/cityzen/update_restaurant_status/' + restaurants.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(restaurants: CityzenRestaurantListInterface) {
    this.router.navigate(['cityzen-team/u/edit-restaurant', restaurants.id]);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onAddRestaurant() {
    this.router.navigate(['cityzen-team/u/add-restaurant']);
  }

  onRestaurantDetail(item: CityzenRestaurantListInterface) {
    console.log(item);
    this.router.navigate(['cityzen-team/u/restaurant-detail', item.id]);
  }

  onSearch() {
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
