import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AdminRestaurantLimitedDetailInterface } from 'src/app/interfaces/admin.restaurant.limited.detail.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { HttpParams } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminRestaurantListInterface } from 'src/app/interfaces/admin.restaurant.list.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-filter-restaurants-query',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './filter-restaurants-query.html',
})
export class FilterRestaurantsQuery {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  restaurants = new MatTableDataSource<AdminRestaurantListInterface>([]);
  displayedColumn = ['name', 'owner', 'location', 'cuisine', 'action'];
  cities: Observable<AdminRestaurantLimitedDetailInterface[]>;
  listOfCities: AdminRestaurantLimitedDetailInterface[] = [];
  cityCtrl = new FormControl('');
  cuisine: Observable<AdminRestaurantLimitedDetailInterface[]>;
  listOfCusines: AdminRestaurantLimitedDetailInterface[] = [];
  cuisineCtrl = new FormControl('');
  categories: Observable<AdminRestaurantLimitedDetailInterface[]>;
  listOfCategories: AdminRestaurantLimitedDetailInterface[] = [];
  categoriesCtrl = new FormControl('');
  facilities: Observable<AdminRestaurantLimitedDetailInterface[]>;
  listOfFacilities: AdminRestaurantLimitedDetailInterface[] = [];
  facilitiesCtrl = new FormControl('');
  types: Observable<AdminRestaurantLimitedDetailInterface[]>;
  listOfTypes: AdminRestaurantLimitedDetailInterface[] = [];
  typesCtrl = new FormControl('');
  cityId: string = '';
  cuisineId: string = '';
  categoryId: string = '';
  facilitiesId: string = '';
  typeId: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  isLoaded: boolean = true;
  exportType: string = 'export';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getInitial();
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/filter_data/').subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        console.log(response);
        if (response && response.cities) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }

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
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterCities(value: string): AdminRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterCusinses(value: string): AdminRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCusines.filter((element) =>
      this.getTranslatedCuisineName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterCategories(value: string): AdminRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCategories.filter((element) =>
      this.getTranslatedCategorytName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterFacilities(value: string): AdminRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfFacilities.filter((element) =>
      this.getTranslatedFacilityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterTypes(value: string): AdminRestaurantLimitedDetailInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfTypes.filter((element) =>
      this.getTranslatedTypeName(element).toLowerCase().includes(filterValue)
    );
  }

  getList() {
    const param = {
      'city': this.cityId,
      'cuisine': this.cuisineId,
      'category': this.categoryId,
      'facility': this.facilitiesId,
      'type': this.typeId,
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
    this.api.post_private('v1/admin/restaurant/filter_restaurant?' + httpParams.toString(), param).subscribe({
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

  onFilter() {
    if (this.cityId == '' && this.cuisineId == '' && this.categoryId == '' && this.facilitiesId == '' && this.typeId == '') {
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

  onRestaurantDetail(item: AdminRestaurantListInterface) {
    console.log(item);
    this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
  }

  onCity(item: AdminRestaurantListInterface) {
    if (item && item.city && item.city.id != '') {
      this.router.navigate(['admin/zone-setup/city-detail', item.city.id]);
    }
  }

  clearFilter() {
    this.cityCtrl.setValue(null);
    this.cuisineCtrl.setValue(null);
    this.categoriesCtrl.setValue(null);
    this.facilitiesCtrl.setValue(null);
    this.typesCtrl.setValue(null);
    this.cityId = '';
    this.cuisineId = '';
    this.categoryId = '';
    this.facilitiesId = '';
    this.typeId = '';
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.cityId = event.option.value;
    }
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

  onExportCollection(exportOption: string) {
    console.log(exportOption);
    if (exportOption != 'export') {
      console.log('exportCollection Now');
      const spinnerRef = this.util.start();
      const param: any = {
        'exportType': exportOption,
        'city': this.cityId,
        'cuisine': this.cuisineId,
        'category': this.categoryId,
        'facility': this.facilitiesId,
        'type': this.typeId,
      };

      let httpParams = new HttpParams();
      Object.keys(param).forEach((key: any) => {
        httpParams = httpParams.set(key, param[key]);
      });
      this.api.export_collection('v1/admin/restaurant/filter_restaurant/export?' + httpParams.toString()).subscribe({
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

  displayCityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find(item => item.id == id);
    return selected ? this.getTranslatedCityName(selected) : '';
  };

  getTranslatedCityName(item: AdminRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCuisineName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCusines.find(item => item.id == id);
    return selected ? this.getTranslatedCuisineName(selected) : '';
  };

  getTranslatedCuisineName(item: AdminRestaurantLimitedDetailInterface): string {
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

  getTranslatedCategorytName(item: AdminRestaurantLimitedDetailInterface): string {
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

  getTranslatedFacilityName(item: AdminRestaurantLimitedDetailInterface): string {
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

  getTranslatedTypeName(item: AdminRestaurantLimitedDetailInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

}
