import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { map, Observable, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-manage-dining-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './manage-dining-campaign.html',
})
export class ManageDiningCampaign {

  action: string = 'add';
  id: string = '';
  campaignForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    restaurant: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
    translations: new FormArray([]),
  });
  displayedColumn = ['name', 'locality', 'owner', 'action'];
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  cities: Observable<AdminCitiesListLimitedInterface[]>;
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl('');
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  tempRestaurans: any[] = [];
  selectedRestaurantList: AdminRestaurantListLimitedInfoInterface[] = [];

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
    this.api.get_private('v1/admin/dining_campaign/getById/' + this.id).subscribe({
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
            this.tempRestaurans = values.restaurant;
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
    this.api.post_private('v1/admin/dining_campaign/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_campaign_added');
        this.router.navigate(['admin/promotion-management/dining-campaign']);
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
    this.api.patch_private('v1/admin/dining_campaign/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_campaign_updated');
        this.router.navigate(['admin/promotion-management/dining-campaign']);
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
      restaurant: '',
      image: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    });
    this.tempRestaurans = [];
    this.selectedRestaurantList = [];
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

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.campaignForm.controls['city'].setValue(event.option.value);
      this.restaurantCtrl.setValue('');
      this.selectedRestaurantList = [...[]];
      this.tempRestaurans = [...[]];
      this.campaignForm.controls['restaurant'].patchValue('');
      this.campaignForm.controls['restaurant'].updateValueAndValidity();
      console.log(this.campaignForm);
      this.getRestaurantByCity(event.option.value);
    }
  }

  getRestaurantByCity(id: string) {
    console.log('get restaurants', id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/getDiningSupportedRestaurantByCityId/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants.length) {
          const mappedList = response.restaurants.map(
            (item: AdminRestaurantListLimitedInfoInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
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
          this.listOfRestaurants = mappedList;
          this.restaurants = this.restaurantCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurant(element) : this.listOfRestaurants.slice()))
          );
          console.log(this.restaurants);
          if (this.action == 'edit') {
            this.listOfRestaurants.forEach((restaurants) => {
              if (this.tempRestaurans.includes(restaurants.id)) {
                this.selectedRestaurantList.push(restaurants);
              }
            });
            this.selectedRestaurantList = [...this.selectedRestaurantList];
            this.campaignForm.controls['restaurant'].patchValue(this.tempRestaurans.join(','));
          }
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

  openedChange(e: any) {
    this.restaurantCtrl.patchValue('');
  }

  selectionChange(event: MatOptionSelectionChange) {
    console.log(event);
    console.log(this.campaignForm);
  }

  onAddRestaurantToCampaign() {
    console.log('value', this.restaurantCtrl.value);
    let selectedRestaurantId: any = this.restaurantCtrl.value;
    if (selectedRestaurantId && selectedRestaurantId != null) {
      const item = this.listOfRestaurants.filter(x => x.id == selectedRestaurantId);
      console.log('selected', item);
      if (item && item.length > 0) {
        const exist = this.selectedRestaurantList.filter(x => x.id == item[0].id);
        console.log('exist', exist);
        if (exist.length <= 0) {
          this.selectedRestaurantList.push(item[0]);
          this.selectedRestaurantList = [...this.selectedRestaurantList];
          console.log('------------------');
          console.log(this.selectedRestaurantList);
          console.log('------------------');
          let ids = this.selectedRestaurantList.map(x => x.id);
          console.log(ids);
          this.campaignForm.controls['restaurant'].setValue(ids.join(','));
        }
      }
    }
    this.restaurantCtrl.setValue('');
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

  onDelete(restaurant: AdminRestaurantListLimitedInfoInterface) {
    console.log(restaurant);
    this.selectedRestaurantList = this.selectedRestaurantList.filter(x => x.id != restaurant.id);
    this.selectedRestaurantList = [...this.selectedRestaurantList];
    const value = this.campaignForm.controls['restaurant'].value ?? '';
    const ids = value.split(',');
    const savedIds = ids.filter(x => x != restaurant.id);
    console.log(savedIds);
    this.campaignForm.controls['restaurant'].setValue(savedIds.join(','));
  }

  onRestaurantDetail(item: AdminRestaurantListLimitedInfoInterface) {
    console.log(item);
    if (item && item.id && item.id != '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', item.id]);
    }
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

}
