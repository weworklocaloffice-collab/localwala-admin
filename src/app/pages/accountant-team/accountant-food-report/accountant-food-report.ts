import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { Observable, map, startWith } from 'rxjs';
import { AccountantCityListInterface } from 'src/app/interfaces/accountant.city.list.interface';
import { AccountantFoodReportInterface } from 'src/app/interfaces/accountant.food.report.interface';
import { AccountantRestaurantListLimitedInfoInterface } from 'src/app/interfaces/accountant.restaurant.list.limited.detail.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-food-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './accountant-food-report.html',
})
export class AccountantFoodReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AccountantFoodReportInterface>([]);
  displayedColumn = ['name', 'restaurant', 'count', 'price', 'sold', 'discount', 'average', 'rating'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  isFilterApplied: boolean = false;
  restaurant: string = '';
  foodType: string = 'none';
  searchQuery: string = '';
  cities: Observable<AccountantCityListInterface[]>;
  listOfCities: AccountantCityListInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AccountantRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AccountantRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getCities();
    this.getList();
  }

  getCities() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/city_list').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response) {
          this.listOfCities = response.map((city: AccountantCityListInterface) => {
            const translation = city.translations.find(t => t.code == this.util.appLocaleName());
            return {
              ...city,
              displayName: translation && translation.value ? translation.value : city.name
            };
          });
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  private _filterArrayItems(value: any): AccountantCityListInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onFilter() {
    this.isFilterApplied = true;
    this.pageSize = 5;
    this.currentPage = 0;
    this.searchQuery = '';
    this.getList();
  }

  onSearch() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.foodType = 'none';
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.foodType = 'none';
    this.searchQuery = '';
    this.getList();
  }

  getList() {
    this.isLoaded = false;

    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'search': this.searchQuery,
      'restaurant': this.restaurant,
      'kind': this.foodType,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/food_report?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AccountantFoodReportInterface) => {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.title || item.name;
              if (item && item.restaurants && item.restaurants?.id) {
                if (item.restaurants?.translations) {
                  const translation2 = item.restaurants.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurants.displayName = translation2?.title || item.restaurants.name;
                } else {
                  item.restaurants.displayName = item.restaurants?.name || '';
                }
              }
              return item;
            }
          );
          this.reports = new MatTableDataSource<AccountantFoodReportInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.reports);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'accountant');
      }
    });
  }

  displayCityName(city: AccountantCityListInterface) {
    return city && city.displayName ? city.displayName : '';
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value && event.option.value.id) {
      this.getRestaurants(event.option.value.id);
    }
  }

  getRestaurants(id: string) {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/restaurant_with_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: AccountantRestaurantListLimitedInfoInterface) => {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.title || item.name;
              if (item && item.locality && item.locality?.id) {
                if (item.locality?.translations) {
                  const translation2 = item.locality.translations.find((t) => t.code == this.util.appLocaleName());
                  item.locality.displayName = translation2?.value || item.locality.name;
                } else {
                  item.locality.displayName = item.locality?.name || '';
                }
              }
              return item;
            }
          );
          this.listOfRestaurants = mappedList;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }


  displayRestaurantName(restaurant: AccountantRestaurantListLimitedInfoInterface) {
    const restaurantName: string = restaurant && restaurant.displayName ? restaurant.displayName : '';
    const localityName: string = restaurant && restaurant.locality && restaurant.locality.displayName ? restaurant.locality.displayName : '';
    const ownerName: string = restaurant && restaurant.ownerInfo && restaurant.ownerInfo.firstName ? `${restaurant.ownerInfo.firstName} ${restaurant.ownerInfo.lastName}` : '';
    return restaurant && restaurant.name ? `${restaurantName} ${localityName != '' ? ' - ' + localityName : ''} ${ownerName != '' ? ' - ' + ownerName : ''}` : '';
  }


  private _filterRestaurant(value: any): AccountantRestaurantListLimitedInfoInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      let selectedRestaurantId: any = this.restaurantCtrl.value;
      console.log('----', selectedRestaurantId);
      this.restaurant = selectedRestaurantId.id;
    }
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'search': this.searchQuery,
        'restaurant': this.restaurant,
        'kind': this.foodType,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/reports/food_report/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'FoodReport.xlsx' : 'FoodReport.csv';
          this.api.download_export_file(blob, fileName);
          this.exportType = 'export';
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.exportType = 'export';
          this.util.handleError(error, 'accountant');
        }
      });
    }
  }

  onRestaurantDetail(item: AccountantFoodReportInterface) {
    console.log(item);
    if (item && item.restaurants && item.restaurants.id && item.restaurants.id !== '') {
      this.router.navigate(['/accountant-team/u/restaurant-detail', item.restaurants.id]);
    }
  }

}
