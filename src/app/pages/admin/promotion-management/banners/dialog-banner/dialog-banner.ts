import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { map, Observable, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { BannerFoodListInterface, BannerRestaurant } from 'src/app/interfaces/banner.foods.list.interface';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-banner',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-banner.html',
})
export class DialogBanner {

  action: string = 'create';
  bannerForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    type: new FormControl('restaurant', [Validators.required]),
    placement: new FormControl('banner'),
    restaurant: new FormControl('', [Validators.required]),
    food: new FormControl(''),
    external: new FormControl(''),
    image: new FormControl(''),
    mediaUrl: new FormControl(''),
    aspectRatio: new FormControl(1.777),
    subtitle: new FormControl(''),
    deepLink: new FormControl(''),
    priority: new FormControl(999),
    isActive: new FormControl(true),
    maxHeight: new FormControl(''),
    displayDuration: new FormControl(5),
    translations: new FormArray([])
  });
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('', [Validators.required]);
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('', [Validators.required]);
  foods: Observable<BannerFoodListInterface[]>;
  listOfFoods: BannerFoodListInterface[] = [];
  foodCtrl = new FormControl('', [Validators.required]);
  editData: any;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogBanner>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      this.editData = this.data.values;
      this.getCities(true);
    } else {
      this.getCities(false);
    }
    this.locale();
  }

  getCities(isEdit: boolean) {
    console.log(isEdit);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
          if (isEdit && this.editData && this.editData.id && this.editData.id != '') {
            console.log('Howdy');
            const banner = this.editData;
            console.log(banner);
            if (banner && banner.translations && banner.translations instanceof Array) {
              this.translations = banner.translations;
              this.locale();
            }
            this.id = banner.id;
            this.bannerForm.controls['type'].setValue(banner.type);
            if (banner.type == 'food') {
              this.bannerForm.controls['restaurant'].clearValidators();
              this.bannerForm.controls['restaurant'].disable();
              this.bannerForm.controls['external'].clearValidators();
              this.bannerForm.controls['external'].disable();
              this.bannerForm.controls['food'].setValidators([Validators.required]);
              this.bannerForm.controls['food'].updateValueAndValidity();
              this.bannerForm.controls['restaurant'].setValue(null);
              this.bannerForm.controls['external'].setValue(null);
              this.restaurantCtrl.setValue(null);
            } else if (banner.type == 'restaurant') {
              this.bannerForm.controls['food'].clearValidators();
              this.bannerForm.controls['food'].disable();
              this.bannerForm.controls['external'].clearValidators();
              this.bannerForm.controls['external'].disable();
              this.bannerForm.controls['restaurant'].setValidators([Validators.required]);
              this.bannerForm.controls['restaurant'].updateValueAndValidity();
              this.bannerForm.controls['food'].setValue(null);
              this.bannerForm.controls['external'].setValue(null);
              this.restaurantCtrl.setValue(null);
              this.foodCtrl.setValue(null);
            } else {
              this.bannerForm.controls['food'].clearValidators();
              this.bannerForm.controls['food'].disable();
              this.bannerForm.controls['food'].setValue(null);
              this.bannerForm.controls['restaurant'].clearValidators();
              this.bannerForm.controls['restaurant'].disable();
              this.bannerForm.controls['restaurant'].setValue(null);
              this.bannerForm.controls['external'].enable();
              this.bannerForm.controls['external'].setValidators([Validators.required]);
              this.bannerForm.controls['external'].updateValueAndValidity();
              this.restaurantCtrl.setValue(null);
              this.foodCtrl.setValue(null);
            }
            this.bannerForm.controls['title'].setValue(banner.title);
            this.bannerForm.controls['placement'].setValue(banner.placement || 'banner');
            this.bannerForm.controls['type'].setValue(banner.type);
            this.bannerForm.controls['subtitle'].setValue(banner && banner.subtitle ? banner.subtitle : '');
            this.bannerForm.controls['mediaUrl'].setValue(banner && banner.mediaUrl ? banner.mediaUrl : '');
            this.bannerForm.controls['aspectRatio'].setValue(banner && banner.aspectRatio ? banner.aspectRatio : 1.777);
            this.bannerForm.controls['deepLink'].setValue(banner && banner.deepLink ? banner.deepLink : '');
            this.bannerForm.controls['priority'].setValue(banner && banner.priority ? banner.priority : 999);
            this.bannerForm.controls['isActive'].setValue(banner && banner.isActive !== undefined ? banner.isActive : true);
            this.bannerForm.controls['maxHeight'].setValue(banner && banner.maxHeight ? banner.maxHeight : '');
            this.bannerForm.controls['displayDuration'].setValue(banner && banner.displayDuration ? banner.displayDuration : 5);
            this.bannerForm.controls['food'].setValue(banner && banner.food && banner.food != null && banner.food != '' ? banner.food : '');
            this.bannerForm.controls['restaurant'].setValue(banner && banner.restaurant && banner.restaurant != null && banner.restaurant != '' ? banner.restaurant : '');
            this.bannerForm.controls['external'].setValue(banner && banner.external && banner.external != null && banner.external != '' ? banner.external : '');
            this.bannerForm.controls['image'].setValue(banner.image);
            if (banner && banner.city && banner.city.id) {
              this.bannerForm.controls['city'].setValue(banner.city.id);
              if (banner && banner.type == 'restaurant') {
                this.getRestaurantByCity(banner.city.id);
              } else if (banner && banner.type == 'food') {
                this.getFoodsByCity(banner.city.id, true);
              }
            }
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          value: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.value = translate.value;
          }
        });
      });
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.bannerForm.controls['image'].value },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.bannerForm.controls['image'].setValue(result.data);
      }
    });
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    const locale = this.bannerForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.bannerForm);
    if (this.bannerForm.valid) {
      if (this.action == 'create') {
        this.saveBanner();
      } else {
        this.updateBanner();
      }
    }
  }

  saveBanner() {
    console.log('on save', this.bannerForm.getRawValue());
    this.isSubmit = true;
    this.api.post_private('v1/admin/banners/save', this.bannerForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_banner_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateBanner() {
    console.log('on update', this.bannerForm.getRawValue());
    this.isSubmit = true;
    this.api.patch_private('v1/admin/banners/update/' + this.id, this.bannerForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_banner_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.bannerForm.controls;
  }

  private _filterCities(value: any): AdminCitiesListLimitedInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    console.log(this.cityCtrl);
    if (event && event.option && event.option.value) {
      this.bannerForm.controls['city'].setValue(event.option.value);
      this.foodCtrl.setValue(null);
      this.restaurantCtrl.setValue(null);
      this.bannerForm.controls['external'].setValue(null);
      this.bannerForm.controls['food'].setValue(null);
      this.bannerForm.controls['restaurant'].setValue(null);
      this.listOfFoods = [...[]];
      this.listOfRestaurants = [...[]];
      if (this.bannerForm.controls['type'].value == 'restaurant') {
        this.getRestaurantByCity(event.option.value);
      } else if (this.bannerForm.controls['type'].value == 'food') {
        this.getFoodsByCity(event.option.value, false);
      }
    }
  }

  getFoodsByCity(id: string, isEdit: boolean) {
    console.log('get food', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/food/getFoodsByCity/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          const mappedList = response.map(
            (item: BannerFoodListInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }

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
          this.listOfFoods = mappedList;
          this.foods = this.foodCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFood(element) : this.listOfFoods.slice()))
          );
          console.log(this.listOfFoods);
          if (isEdit == true) {
            this.foodCtrl.patchValue(this.bannerForm.value.food ?? null);
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    this.bannerForm.controls['restaurant'].setValue(event.option.value);
  }

  onFoodSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    this.bannerForm.controls['food'].setValue(event.option.value);
  }

  getRestaurantByCity(id: string) {
    console.log('get restaurants', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/getRestaurantByCityIdLimitedData/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: AdminRestaurantListLimitedInfoInterface) => {
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
          this.listOfRestaurants = mappedList;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
          this.restaurantCtrl.patchValue(this.bannerForm.value.restaurant ?? null);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterRestaurant(value: any): AdminRestaurantListLimitedInfoInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      this.getTranslateRestaurantName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterFood(value: any): BannerFoodListInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.name && value.restaurants && value.restaurants.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfFoods.filter((element) =>
      this.getTranslateFoodName(element).toLowerCase().includes(filterValue)
    );
  }

  getTranslateRestaurantName(item: AdminRestaurantListLimitedInfoInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  getLocalityName(item: RestaurantLocality): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayRestaurantName = (id: string): string => {
    if (!id) return '';
    console.log(id);
    const selected = this.listOfRestaurants.find(item => item.id == id);
    const selectedLocality = selected ? this.getLocalityName(selected.locality) : '';
    const restaurantName = selected ? this.getTranslateRestaurantName(selected) : '';
    const ownerName: string = selected && selected.ownerInfo && selected.ownerInfo.firstName ? `${selected.ownerInfo.firstName} ${selected.ownerInfo.lastName}` : '';
    return `${restaurantName} ${selectedLocality ? ' - ' + selectedLocality + ' - ' + ownerName : ''}`
  };

  onTypeChanged(event: MatSelectChange) {
    console.log(event);
    const val = event.value;
    this.bannerForm.controls['restaurant'].clearValidators();
    this.bannerForm.controls['restaurant'].disable();
    this.bannerForm.controls['restaurant'].setValue(null);
    this.bannerForm.controls['food'].clearValidators();
    this.bannerForm.controls['food'].disable();
    this.bannerForm.controls['food'].setValue(null);
    this.bannerForm.controls['external'].clearValidators();
    this.bannerForm.controls['external'].disable();
    this.bannerForm.controls['external'].setValue(null);
    this.bannerForm.controls['mediaUrl'].clearValidators();
    this.bannerForm.controls['mediaUrl'].disable();
    this.bannerForm.controls['mediaUrl'].setValue(null);
    this.restaurantCtrl.setValue(null);
    this.foodCtrl.setValue(null);

    if (val == 'food') {
      this.bannerForm.controls['food'].setValidators([Validators.required]);
      this.bannerForm.controls['food'].updateValueAndValidity();
    } else if (val == 'restaurant') {
      this.bannerForm.controls['restaurant'].setValidators([Validators.required]);
      this.bannerForm.controls['restaurant'].updateValueAndValidity();
    } else if (val == 'external') {
      this.bannerForm.controls['external'].setValidators([Validators.required]);
      this.bannerForm.controls['external'].updateValueAndValidity();
    } else if (val == 'image' || val == 'lottie' || val == 'video') {
      this.bannerForm.controls['mediaUrl'].enable();
      this.bannerForm.controls['mediaUrl'].setValidators([Validators.required]);
      this.bannerForm.controls['mediaUrl'].updateValueAndValidity();
    }

    this.bannerForm.controls['city'].setValue('');
    this.cityCtrl.setValue(null);
    this.listOfRestaurants = [...[]];
    this.listOfFoods = [...[]];
  }

  getTranslatedCityName(item: AdminCitiesListLimitedInterface): string {
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

  getTranslateFoodName(item: BannerFoodListInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  getBannerRestaurantName(item: BannerRestaurant): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  displayFoodName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfFoods.find(item => item.id == id);
    const selectedRestaurant = selected ? this.getBannerRestaurantName(selected.restaurants) : '';
    const restaurantName = selected ? this.getTranslateFoodName(selected) : '';
    return `${restaurantName} ${selectedRestaurant ? ' - ' + selectedRestaurant : ''}`
  };

}
