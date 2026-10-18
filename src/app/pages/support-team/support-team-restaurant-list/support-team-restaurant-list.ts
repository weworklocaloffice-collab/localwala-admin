import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SupportTeamRestaurantListInterface } from 'src/app/interfaces/support.team.restaurant.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSupportTeamRestaurantDetail } from './dialog-support-team-restaurant-detail/dialog-support-team-restaurant-detail';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { SupportTeamCitiesListLimitedInterface } from 'src/app/interfaces/support.team.city.list.interface';
import { SupportTeamRestaurantTypeListForRestaurantInterface } from 'src/app/interfaces/support.team.restaurant.type.list.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-support-team-restaurant-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './support-team-restaurant-list.html',
})
export class SupportTeamRestaurantList {

  @ViewChild('paginator', { read: MatPaginator, static: false }) paginator: MatPaginator;
  restuarants = new MatTableDataSource<SupportTeamRestaurantListInterface>([]);
  displayedColumn = ['name', 'owner', 'city', 'foods', 'orders', 'pos', 'table', 'dining', 'rating', 'action'];
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = false;
  isFilterApplied: boolean = false;
  city: string = '';
  type: string = 'commission';
  category: string = '';
  searchQuery: string = '';
  cities: Observable<SupportTeamCitiesListLimitedInterface[]>;
  listOfCities: SupportTeamCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  typeList: Observable<SupportTeamRestaurantTypeListForRestaurantInterface[]>;
  listOfType: SupportTeamRestaurantTypeListForRestaurantInterface[] = [];
  typeCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getInitial();
    this.getList();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/support_team/restaurant_initial').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.city && response.city.length) {
          this.listOfCities = response.city;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
        }

        if (response && response.restaurantType && response.restaurantType.length) {
          this.listOfType = response.restaurantType;
          this.typeList = this.typeCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantType(element) : this.listOfType.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'support-team');
      }
    });
  }

  private _filterArrayItems(value: string): SupportTeamCitiesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantType(value: string): SupportTeamRestaurantTypeListForRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfType.filter((element) =>
      this.getTranslatedTypeName(element).toLowerCase().includes(filterValue)
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

    this.api.get_private('v1/support_team/restaurant_list?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.results) {
          const mappedList = response.results.map(
            (item: SupportTeamRestaurantListInterface) => {
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
              return item;
            }
          );
          this.restuarants = new MatTableDataSource<SupportTeamRestaurantListInterface>(mappedList);
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
          console.log(this.restuarants);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'support-team');
      }
    });
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onDetail(item: SupportTeamRestaurantListInterface) {
    console.log(item);
    this.dialog.open(DialogSupportTeamRestaurantDetail, {
      data: { id: item.id },
      disableClose: true
    });
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.city = event.option.value;
    }
  }

  onCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.category = event.option.value;
    }
  }

  getTranslatedCityName(item: SupportTeamCitiesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find(item => item.id == id);
    return selected ? this.getTranslatedCityName(selected) : '';
  };

  getTranslatedTypeName(item: SupportTeamRestaurantTypeListForRestaurantInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayTypeName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfType.find(item => item.id == id);
    return selected ? this.getTranslatedTypeName(selected) : '';
  };

}
