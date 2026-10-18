import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenRestaurantComplaintListInterface } from 'src/app/interfaces/cityzen.restaurant.complaints.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-restaurant-complaint-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-restaurant-complaint-list.html',
})
export class CityzenRestaurantComplaintList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  complaints = new MatTableDataSource<CityzenRestaurantComplaintListInterface>([]);
  displayedColumn = ['id', 'restaurant', 'reason', 'with', 'detail', 'status'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  filterStatus: boolean = true;
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
      'status': this.filterStatus,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/cityzen/restaurant_complaints_list/' + this.util.getItem('_uid') + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.complaints) {
          const mappedList = response.complaints.map(
            (item: CityzenRestaurantComplaintListInterface) => {
              if (item && item.reasons && item.reasons?.id) {
                if (item.reasons?.translations) {
                  const translation = item.reasons.translations.find((t) => t.code == this.util.appLocaleName());
                  item.reasons.displayName = translation?.value || item.reasons.name;
                } else {
                  item.reasons.displayName = item.reasons?.name || '';
                }
              }

              if (item && item.restaurantInfo && item.restaurantInfo?.id) {
                if (item.restaurantInfo?.translations) {
                  const translation = item.restaurantInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurantInfo.displayName = translation?.title || item.restaurantInfo.name;
                } else {
                  item.restaurantInfo.displayName = item.restaurantInfo?.name || '';
                }
              }
              return item;
            }
          );
          this.complaints = new MatTableDataSource<CityzenRestaurantComplaintListInterface>(mappedList);
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

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onFilterChangeEvent(newStatus: boolean) {
    console.log(newStatus);
    this.filterStatus = newStatus;
    this.getList();
  }

  onRestaurantDetail(item: CityzenRestaurantComplaintListInterface) {
    console.log(item);
    if (item && item.restaurantInfo && item.restaurantInfo.id && item.restaurantInfo.id !== '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.restaurantInfo.id]);
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
