import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenOutletListInterface } from 'src/app/interfaces/cityzen.outlet.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-outlets',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-outlets.html',
})
export class CityzenOutlets {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<CityzenOutletListInterface>([]);
  displayedColumn = ['name', 'owner', 'restaurant', 'location', 'cuisine', 'status', 'action'];
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
    this.api.get_private('v1/cityzen/outlet_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenOutletListInterface) => {
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

              if (item && item.manager && item.manager?.id) {
                if (item.manager?.translations) {
                  const translation = item.manager.translations.find((t) => t.code == this.util.appLocaleName());
                  item.manager.displayName = translation?.title || item.manager.name;
                } else {
                  item.manager.displayName = item.manager?.name || '';
                }
              }

              return item;
            }
          );
          this.restaurants = new MatTableDataSource<CityzenOutletListInterface>(mappedList);
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

  onStatusChange(event: MatSlideToggleChange, restaurants: CityzenOutletListInterface) {
    console.log(event);
    console.log(restaurants);
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

  onEdit(restaurants: CityzenOutletListInterface) {
    console.log(restaurants);
    console.log(restaurants.id);
    this.router.navigate(['cityzen-team/u/edit-restaurant', restaurants.id]);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onOutletManagerDetail(item: CityzenOutletListInterface) {
    console.log(item);
    if (item && item.manager && item.manager.id && item.manager.id != '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.manager.id]);
    }
  }

  onRestaurantDetail(item: CityzenOutletListInterface) {
    console.log(item);
    this.router.navigate(['cityzen-team/u/restaurant-detail', item.id]);
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
