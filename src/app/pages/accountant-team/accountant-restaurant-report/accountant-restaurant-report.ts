import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { AccountantCityListInterface } from 'src/app/interfaces/accountant.city.list.interface';
import { AccountantRestaurantReportInterface } from 'src/app/interfaces/accountant.restaurant.report.interface';
import { AccountantRestaurantTypeInterface } from 'src/app/interfaces/accountant.restaurant.type.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-restaurant-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './accountant-restaurant-report.html',
})
export class AccountantRestaurantReport {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  reports = new MatTableDataSource<AccountantRestaurantReportInterface>([]);
  displayedColumn = ['name', 'city', 'foods', 'orders', 'pos', 'table', 'dining', 'rating'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  exportType: string = 'export';
  isFilterApplied: boolean = false;
  city: string = '';
  type: string = 'commission';
  category: string = '';
  searchQuery: string = '';
  cities: Observable<AccountantCityListInterface[]>;
  listOfCities: AccountantCityListInterface[] = [];
  cityCtrl = new FormControl('');
  typeList: Observable<AccountantRestaurantTypeInterface[]>;
  listOfType: AccountantRestaurantTypeInterface[] = [];
  typeCtrl = new FormControl('');

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getInitial();
    this.getList();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/restaurant_report_initial').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.city) {
          this.listOfCities = response.city.map((city: AccountantCityListInterface) => {
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

        if (response && response.restaurantType) {
          this.listOfType = response.restaurantType.map((item: AccountantRestaurantTypeInterface) => {
            const translation = item.translations.find(t => t.code == this.util.appLocaleName());
            return {
              ...item,
              displayName: translation && translation.value ? translation.value : item.name
            };
          });
          this.typeList = this.typeCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantType(element) : this.listOfType.slice()))
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

  private _filterRestaurantType(value: any): AccountantRestaurantTypeInterface[] {
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfType.filter((element) =>
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
    this.city = '';
    this.type = '';
    this.category = '';
    this.paginator.firstPage();
    this.getList();
  }

  clearFilter() {
    this.isFilterApplied = false;
    this.pageSize = 5;
    this.currentPage = 0;
    this.city = '';
    this.type = '';
    this.category = '';
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
      'city': this.city,
      'type': this.type,
      'category': this.category,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/accountant/restaurant_report?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: AccountantRestaurantReportInterface) => {
              const mainTranslations = item.translations.find((t) => t.code == this.util.appLocaleName());
              if (mainTranslations) {
                item.displayName = mainTranslations?.title || item.name;
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
              return item;
            }
          );
          this.reports = new MatTableDataSource<AccountantRestaurantReportInterface>(mappedList);
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
      this.city = event.option.value.id;
    }
  }

  displayTypeName(type: AccountantRestaurantTypeInterface) {
    return type && type.displayName ? type.displayName : '';
  }

  onCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value && event.option.value.id) {
      this.category = event.option.value.id;
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
        'exportType': exportOption,
        'filter': this.isFilterApplied,
        'search': this.searchQuery,
        'city': this.city,
        'type': this.type,
        'category': this.category,
      };
      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/accountant/reports/restaurant/export?' + httpParams.toString()).subscribe({
        next: (blob: Blob) => {
          this.util.stop(spinnerRef);
          const fileName = exportOption == 'excel' ? 'RestaurantReports.xlsx' : 'RestaurantReports.csv';
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

  onRestaurantDetail(item: AccountantRestaurantReportInterface) {
    console.log(item);
    if (item.id && item.id != '') {
      this.router.navigate(['/accountant-team/u/restaurant-detail', item.id]);
    }
  }

}
