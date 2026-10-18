import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { map, Observable, startWith } from 'rxjs';
import { CityzenRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/cityzen.restaurant.list.limited.info.interface';
import { CityzenMediaImagesDialog } from 'src/app/pages/city-master-team/cityzen-media-images-dialog/cityzen-media-images-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-manage-dining-campaign',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-manage-dining-campaign.html',
})
export class CityzenManageDiningCampaign {

  action: string = 'add';
  id: string = '';
  campaignForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
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
  restaurants: Observable<CityzenRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: CityzenRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  tempRestaurans: any[] = [];
  selectedRestaurantList: CityzenRestaurantListLimitedInfoInterface[] = [];

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
      this.getRestaurantByCity();
      this.locale();
    }
  }

  getInfo() {
    console.log('get info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/dining_campaign_deep_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        const values = response;
        this.tempRestaurans = values.restaurant;
        this.getRestaurantByCity();
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
        this.util.handleError(error, 'cityzen');
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
    this.api.post_private('v1/cityzen/create_dining_campaign/' + this.util.getItem('_uid'), sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_campaign_added');
        this.router.navigate(['cityzen-team/campaign-section/dining-campaign']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onUpdateCampaign() {
    console.log('update');
    const sendData = this.campaignForm.getRawValue();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/cityzen/update_dining_campaign/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_dining_campaign_updated');
        this.router.navigate(['cityzen-team/campaign-section/dining-campaign']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.campaignForm.patchValue({
      title: '',
      shortDescription: '',
      restaurant: '',
      image: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    });

    (this.campaignForm.get('translations') as FormArray).clear();
    this.tempRestaurans = [];
    this.selectedRestaurantList = [];
    this.haveSubmitClicked = false;
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;
    console.log(this.campaignForm.getRawValue());
  }

  get f() {
    return this.campaignForm.controls;
  }

  onImageClick() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
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

  getRestaurantByCity() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_cityzen/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants.length) {
          const mappedList = response.restaurants.map(
            (item: CityzenRestaurantListLimitedInfoInterface) => {
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
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterRestaurant(value: any): CityzenRestaurantListLimitedInfoInterface[] {
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
    let selectedRestaurantId: any = this.restaurantCtrl.value;
    if (selectedRestaurantId && selectedRestaurantId != null) {
      const item = this.listOfRestaurants.filter(x => x.id == selectedRestaurantId);
      if (item && item.length > 0) {
        const exist = this.selectedRestaurantList.filter(x => x.id == item[0].id);
        if (exist.length <= 0) {
          this.selectedRestaurantList.push(item[0]);
          this.selectedRestaurantList = [...this.selectedRestaurantList];
          let ids = this.selectedRestaurantList.map(x => x.id);
          this.campaignForm.controls['restaurant'].setValue(ids.join(','));
        }
      }
    }
    this.restaurantCtrl.setValue('');
  }

  getTranslateRestaurantName(item: CityzenRestaurantListLimitedInfoInterface): string {
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

  onDelete(restaurant: CityzenRestaurantListLimitedInfoInterface) {
    this.selectedRestaurantList = this.selectedRestaurantList.filter(x => x.id != restaurant.id);
    this.selectedRestaurantList = [...this.selectedRestaurantList];
    const value = this.campaignForm.controls['restaurant'].value ?? '';
    const ids = value.split(',');
    const savedIds = ids.filter(x => x != restaurant.id);
    this.campaignForm.controls['restaurant'].setValue(savedIds.join(','));
  }

  onRestaurantDetail(item: CityzenRestaurantListLimitedInfoInterface) {
    if (item && item.id && item.id != '') {
      this.router.navigate(['cityzen-team/u/restaurant-detail', item.id]);
    }
  }

}
