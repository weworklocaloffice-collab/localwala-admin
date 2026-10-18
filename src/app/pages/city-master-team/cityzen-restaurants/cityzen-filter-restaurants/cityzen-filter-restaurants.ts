import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CityzenRestaurantLimitedDetailInterface } from 'src/app/interfaces/cityzen.restaurant.limited.detail.interface';
import { CityzenRestaurantListInterface } from 'src/app/interfaces/cityzen.restaurant.list.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-filter-restaurants',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-filter-restaurants.html',
})
export class CityzenFilterRestaurants {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<CityzenRestaurantListInterface>([]);
  displayedColumn = ['name', 'owner', 'location', 'cuisine', 'action'];
  cuisine: Observable<CityzenRestaurantLimitedDetailInterface[]>;
  listOfCusines: CityzenRestaurantLimitedDetailInterface[] = [];
  cuisineCtrl = new FormControl('');
  categories: Observable<CityzenRestaurantLimitedDetailInterface[]>;
  listOfCategories: CityzenRestaurantLimitedDetailInterface[] = [];
  categoriesCtrl = new FormControl('');
  facilities: Observable<CityzenRestaurantLimitedDetailInterface[]>;
  listOfFacilities: CityzenRestaurantLimitedDetailInterface[] = [];
  facilitiesCtrl = new FormControl('');
  types: Observable<CityzenRestaurantLimitedDetailInterface[]>;
  listOfTypes: CityzenRestaurantLimitedDetailInterface[] = [];
  typesCtrl = new FormControl('');
  cuisineId: string = '';
  categoryId: string = '';
  facilitiesId: string = '';
  typeId: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getInitial();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/filter_restaurant_data/').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);

        if (response && response.cuisine) {
          this.listOfCusines = response.cuisine;
          this.cuisine = this.cuisineCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCusinses(element) : this.listOfCusines.slice()))
          );
        }

        if (response && response.categories) {
          this.listOfCategories = response.categories;
          this.categories = this.categoriesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCategories(element) : this.listOfCategories.slice()))
          );
        }

        if (response && response.facilities) {
          this.listOfFacilities = response.facilities;
          this.facilities = this.facilitiesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFacilities(element) : this.listOfFacilities.slice()))
          );
        }

        if (response && response.types) {
          this.listOfTypes = response.types;
          this.types = this.typesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterTypes(element) : this.listOfTypes.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterCusinses(value: string): CityzenRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCusines.filter((element) =>
      this.getTranslatedCuisineName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterCategories(value: string): CityzenRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCategories.filter((element) =>
      this.getTranslatedCategorytName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterFacilities(value: string): CityzenRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfFacilities.filter((element) =>
      this.getTranslatedFacilityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterTypes(value: string): CityzenRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfTypes.filter((element) =>
      this.getTranslatedTypeName(element).toLowerCase().includes(filterValue)
    );
  }

  getList() {
    const param = {
      'cuisine': this.cuisineId,
      'category': this.categoryId,
      'facility': this.facilitiesId,
      'type': this.typeId,
      'master': this.util.getItem('_uid')
    };
    console.log(param);
    this.isLoaded = false;
    const optionParam: any = {
      'limit': this.pageSize,
      'page': this.currentPage,
    };
    let httpParams = new HttpParams();
    Object.keys(optionParam).forEach((key: any) => {
      httpParams = httpParams.set(key, optionParam[key]);
    });
    this.api.post_private('v1/cityzen/filter_restaurant?' + httpParams.toString(), param).subscribe({
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

  onFilter() {
    if (this.cuisineId == '' && this.categoryId == '' && this.facilitiesId == '' && this.typeId == '') {
      this.util.onError('ts_please_select_filter', '');
      return;
    }
    this.pageSize = 5;
    this.currentPage = 0;
    this.paginator.firstPage();
    this.getList();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onRestaurantDetail(item: CityzenRestaurantListInterface) {
    console.log(item);
    this.router.navigate(['cityzen-team/u/restaurant-detail', item.id]);
  }

  clearFilter() {
    this.cuisineCtrl.setValue(null);
    this.categoriesCtrl.setValue(null);
    this.facilitiesCtrl.setValue(null);
    this.typesCtrl.setValue(null);
    this.cuisineId = '';
    this.categoryId = '';
    this.facilitiesId = '';
    this.typeId = '';
  }

  onCusineSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.cuisineId = event.option.value;
    }
  }

  onCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.categoryId = event.option.value;
    }
  }

  onFacilitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.facilitiesId = event.option.value;
    }
  }

  onTypeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.typeId = event.option.value;
    }
  }

  displayCuisineName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCusines.find(item => item.id == id);
    return selected ? this.getTranslatedCuisineName(selected) : '';
  };

  getTranslatedCuisineName(item: CityzenRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCategoryName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCategories.find(item => item.id == id);
    return selected ? this.getTranslatedCategorytName(selected) : '';
  };

  getTranslatedCategorytName(item: CityzenRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayFacilityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfFacilities.find(item => item.id == id);
    return selected ? this.getTranslatedFacilityName(selected) : '';
  };

  getTranslatedFacilityName(item: CityzenRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayTypesName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfTypes.find(item => item.id == id);
    return selected ? this.getTranslatedTypeName(selected) : '';
  };

  getTranslatedTypeName(item: CityzenRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

}
