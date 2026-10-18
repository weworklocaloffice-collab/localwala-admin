import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { Observable, startWith, map } from 'rxjs';
import { AccountantCityListInterface } from 'src/app/interfaces/accountant.city.list.interface';
import { AccountantRestaurantListLimitedInfoInterface } from 'src/app/interfaces/accountant.restaurant.list.limited.detail.interface';
import { AccountantTableOrderReportInterface } from 'src/app/interfaces/accountant.table.order.report.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-accountant-table-order-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatNativeDateModule],
  templateUrl: './accountant-table-order-report.html',
})
export class AccountantTableOrderReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AccountantTableOrderReportInterface>([]);
  displayedColumn = ['id', 'customer', 'restaurant', 'payment', 'real_total', 'item_discount', 'item_total', 'discount', 'food_tax', 'service_tax', 'package_charge', 'package_charge_tax', 'waiter_tip', 'extra_charge', 'grand_total', 'commission', 'date', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  isFilterApplied: boolean = false;
  filterDates = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  restaurant: string = '';
  cities: Observable<AccountantCityListInterface[]>;
  listOfCities: AccountantCityListInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AccountantRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AccountantRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  searchQuery: string = '';

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
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.restaurant = '';
    this.filterDates.controls['start'].setValue(null);
    this.filterDates.controls['end'].setValue(null);
    this.paginator.firstPage();
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    let filterStartDate = '';
    let filterEndDate = '';
    if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
      const start = this.filterDates.controls['start'].value;
      const end = this.filterDates.controls['end'].value;
      filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
      filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
    }
    const param: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
      'filter': this.isFilterApplied,
      'restaurant': this.restaurant,
      'filterDates': `${filterStartDate}-${filterEndDate}`,
      'search': this.searchQuery,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/table_order_report?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AccountantTableOrderReportInterface) => {
              if (item && item.restaurant && item.restaurant?.id) {
                if (item.restaurant?.translations) {
                  const translation = item.restaurant.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurant.displayName = translation?.title || item.restaurant.name;
                } else {
                  item.restaurant.displayName = item.restaurant?.name || '';
                }
              }
              return item;
            }
          );
          this.reports = new MatTableDataSource<AccountantTableOrderReportInterface>(mappedList);
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

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

  onOrderDetailPage(orderId: string) {
    console.log(orderId);
    this.router.navigate(['/accountant-team/u/table-order-detail', orderId]);
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
      let filterStartDate = '';
      let filterEndDate = '';
      if (this.filterDates.controls['start'].value != null && this.filterDates.controls['end'].value != null) {
        const start = this.filterDates.controls['start'].value;
        const end = this.filterDates.controls['end'].value;
        filterStartDate = DateTime.fromJSDate(new Date(start)).toFormat('dd/MM/yyyy');
        filterEndDate = DateTime.fromJSDate(new Date(end)).toFormat('dd/MM/yyyy');
      }
      const param: any = {
        'type': exportOption,
        'filter': this.isFilterApplied,
        'restaurant': this.restaurant,
        'filterDates': `${filterStartDate}-${filterEndDate}`,
        'search': this.searchQuery,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/reports/table_orders/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'TableOrders.xlsx' : 'TableOrders.csv';
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

  onRestaurantDetail(item: AccountantTableOrderReportInterface) {
    console.log(item);
    if (item && item.restaurant && item.restaurant.id && item.restaurant.id !== '') {
      this.router.navigate(['/accountant-team/u/restaurant-detail', item.restaurant.id]);
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
