import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenRestaurantKitchenOwnerListInterface } from 'src/app/interfaces/cityzen.restaurant.kitchen.owner.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-restaurant-kitchen-owner-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-restaurant-kitchen-owner-list.html',
})
export class CityzenRestaurantKitchenOwnerList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  owners = new MatTableDataSource<CityzenRestaurantKitchenOwnerListInterface>([]);
  displayedColumn = ['name', 'contact', 'restaurants', 'status', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
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
    this.api.get_private('v1/cityzen/kitchen_owners_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: CityzenRestaurantKitchenOwnerListInterface) => {
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
          this.owners = new MatTableDataSource<CityzenRestaurantKitchenOwnerListInterface>(mappedList);
          console.log(this.owners);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusChange(event: MatSlideToggleChange, owner: CityzenRestaurantKitchenOwnerListInterface) {
    console.log(event);
    console.log(owner);
    owner.status = event.checked;
    this.api.patch_private('v1/cityzen/kitchen_owner/update_kitchen_status/' + owner.id, { status: event.checked }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.onSuccess('ts_status_updated');
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onEdit(owner: CityzenRestaurantKitchenOwnerListInterface) {
    console.log(owner);
    console.log(owner.id);
    this.router.navigate(['cityzen-team/u/edit-restaurant-kitchen-owner', owner.id]);
  }

  onRestaurantDetail(item: CityzenRestaurantKitchenOwnerListInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurants.id]);
    }
  }

  onSearch() {
    console.log(`on search ${this.searchQuery}`);
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

}
