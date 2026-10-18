import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminRestaurantListInterface } from 'src/app/interfaces/admin.restaurant.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-filter-restaurants-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './filter-restaurants-list.html',
})
export class FilterRestaurantsList {
  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<AdminRestaurantListInterface>([]);
  displayedColumn = ['name', 'owner', 'location', 'cuisine', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  id: string = '';
  type: string = '';
  name: string = '';
  exportType: string = 'export';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.type = this.route.snapshot.paramMap.get('type') ?? '';
    this.name = this.route.snapshot.paramMap.get('name') ?? '';
    console.log(this.id, this.type);
    if (this.id && this.id != '' && this.type && this.type != '' && this.name && this.name != '') {
      this.getList();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/restaurant/filter/' + this.type + '/' + this.id + '?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedRestaurants = response.results.map(
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
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.restaurants);
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
    this.getList();
  }

  onRestaurantDetail(item: AdminRestaurantListInterface) {
    console.log(item);
    this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
  }

  onCity(item: AdminRestaurantListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
    }
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      this.api.export_collection('v1/admin/restaurant/filter/export/' + exportOption + '/' + this.type + '/' + this.id).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          if (exportOption != 'raw') {
            const fileName = exportOption == 'excel' ? 'Restaurants.xlsx' : 'Restaurants.csv';
            this.api.download_export_file(blob, fileName);
          } else {
            const fileName = 'restaurants.json';
            this.api.download_export_file(blob, fileName);
          }
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'admin');
        }
      });
    }
  }
}
