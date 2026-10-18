import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DateTime } from 'luxon';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminRestaurantFoodListLimitedInterface } from 'src/app/interfaces/admin.restaurant.foods.list.limited.inteface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-manage-food-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './manage-food-campaign.html',
})
export class ManageFoodCampaign {

  action: string = 'add';
  id: string = '';
  campaignForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    foods: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
  });
  displayedColumn = ['name', 'price', 'discount', 'addons', 'variations', 'action'];
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  foods: Observable<AdminRestaurantFoodListLimitedInterface[]>;
  listOfFoods: AdminRestaurantFoodListLimitedInterface[] = [];
  foodCtrl = new FormControl('');
  selectedFoodList: AdminRestaurantFoodListLimitedInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log(this.action, this.id);
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getInfo();
    } else {
      this.getBasicData();
      this.locale();
    }
  }

  getInfo() {
    console.log('get info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/food_campaign/getById/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
          const values = response.info;
          if (values && values.id == this.id) {
            this.getRestaurantByCity(values.city);
            this.campaignForm.controls['city'].setValue(values.city);
          }
        }
        const values = response.info;
        if (values && values.id == this.id) {
          if (values && values.translations && values.translations instanceof Array) {
            this.translations = values.translations;
            this.locale();
          }
          this.campaignForm.controls['title'].setValue(values.title);
          this.campaignForm.controls['shortDescription'].setValue(values.shortDescription);
          this.campaignForm.controls['image'].setValue(values.image);
          const startDate = DateTime.fromISO(values.startDate).toFormat('yyyy-MM-dd');
          const endDate = DateTime.fromISO(values.endDate).toFormat('yyyy-MM-dd');
          console.log(startDate, endDate);
          this.campaignForm.controls['startDate'].setValue(startDate);
          this.campaignForm.controls['endDate'].setValue(endDate);
          this.campaignForm.controls['startTime'].setValue(values.startTime);
          this.campaignForm.controls['endTime'].setValue(values.endTime);

          const mappedList = values.foods.map(
            (item: AdminRestaurantFoodListLimitedInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );

          this.selectedFoodList = [...mappedList];
          let ids = this.selectedFoodList.map(x => x.id);
          console.log(ids);
          this.campaignForm.controls['foods'].setValue(ids.join(','));
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getBasicData() {
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
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.action);
    console.log(this.campaignForm);
    this.haveSubmitClicked = true;
    const locale = this.campaignForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], shortDescription: [element.shortDescription] }));
    });
    console.log(this.campaignForm.getRawValue());
    if (this.campaignForm.valid) {
      console.log('on submit');
      if (this.action == 'add') {
        this.onSaveCampaign();
      } else {
        this.onUpdateCampaign();
      }
    }
  }

  onSaveCampaign() {
    console.log('save');
    console.log(this.campaignForm);
    console.log(this.campaignForm.value);
    const sendData = this.campaignForm.getRawValue();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/food_campaign/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_campaign_added');
        this.router.navigate(['admin/promotion-management/food-campaign']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdateCampaign() {
    console.log('update');
    const sendData = this.campaignForm.getRawValue();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/food_campaign/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_campaign_updated');
        this.router.navigate(['admin/promotion-management/food-campaign']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    (this.campaignForm.get('translations') as FormArray).clear();
    this.campaignForm.patchValue({
      title: '',
      shortDescription: '',
      city: '',
      foods: '',
      image: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    });
    this.selectedFoodList = [];
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.campaignForm.controls;
  }

  private _filterCities(value: string): AdminCitiesListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          title: '',
          shortDescription: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.shortDescription = translate.shortDescription;
          }
        });
      });
    }
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.campaignForm.controls['city'].setValue(event.option.value);
      this.restaurantCtrl.setValue('');
      this.foodCtrl.setValue('');
      this.campaignForm.controls['foods'].setValue('');
      this.selectedFoodList = [...[]];
      console.log(this.campaignForm);
      this.getRestaurantByCity(event.option.value);
    }
  }

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    this.getFoodsByRestaurants(event.option.value);
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
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterRestaurant(value: any): AdminRestaurantListLimitedInfoInterface[] {
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
    const selected = this.listOfRestaurants.find(item => item.id == id);
    const selectedLocality = selected ? this.getLocalityName(selected.locality) : '';
    const restaurantName = selected ? this.getTranslateRestaurantName(selected) : '';
    const ownerName: string = selected && selected.ownerInfo && selected.ownerInfo.firstName ? `${selected.ownerInfo.firstName} ${selected.ownerInfo.lastName}` : '';
    return `${restaurantName} ${selectedLocality ? ' - ' + selectedLocality + ' - ' + ownerName : ''}`
  };

  onImageClick() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.campaignForm.controls['image'].value },
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
        this.campaignForm.controls['image'].setValue(result.data);
      }
    });
  }

  getFoodsByRestaurants(id: string) {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/food_campaign/getFoodByRestaurant/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.foods && response.foods) {
          const mappedList = response.foods.map(
            (item: AdminRestaurantFoodListLimitedInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfFoods = mappedList;
          this.foods = this.foodCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoods(element) : this.listOfFoods.slice()))
          );
          console.log(this.foods);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  private _filterFoods(value: any): AdminRestaurantFoodListLimitedInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfFoods.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onAddFoodToCampaign() {
    console.log('value', this.foodCtrl);
    let selectedFoodId: any = this.foodCtrl.value;
    if (selectedFoodId) {
      const item = this.listOfFoods.filter(x => x.id == selectedFoodId);
      console.log('selected', item);
      if (item && item.length > 0) {
        const exist = this.selectedFoodList.filter(x => x.id == item[0].id);
        console.log('exist', exist);
        if (exist.length <= 0) {
          this.selectedFoodList.push(item[0]);
          this.selectedFoodList = [...this.selectedFoodList];
          console.log('------------------');
          console.log(this.selectedFoodList);
          console.log('------------------');
          let ids = this.selectedFoodList.map(x => x.id);
          console.log(ids);
          this.campaignForm.controls['foods'].setValue(ids.join(','));
        }
      }
    }
    this.foodCtrl.setValue('');
  }

  onDelete(food: AdminRestaurantFoodListLimitedInterface) {
    console.log(food);
    this.selectedFoodList = this.selectedFoodList.filter(x => x.id != food.id);
    this.selectedFoodList = [...this.selectedFoodList];
    const value = this.campaignForm.controls['foods'].value ?? '';
    const ids = value.split(',');
    const savedIds = ids.filter(x => x != food.id);
    console.log(savedIds);
    this.campaignForm.controls['foods'].setValue(savedIds.join(','));
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

  getTranslatedFoodName(item: AdminRestaurantFoodListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  displayFoodName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfFoods.find(item => item.id == id);
    return selected ? this.getTranslatedFoodName(selected) : '';
  };

}
