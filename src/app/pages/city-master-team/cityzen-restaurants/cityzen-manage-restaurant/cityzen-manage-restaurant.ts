import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatRadioChange } from '@angular/material/radio';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CityzenCuisineListForRestaurantInterface } from 'src/app/interfaces/cityzen.cuisine.list.for.restaurant.interface';
import { CityzenRestaurantTypeListForRestaurantInterface } from 'src/app/interfaces/cityzen.restaurant.type.list.for.restaurant.interface';
import { CityzenFacilitiesListForNewRestaurantInterface } from 'src/app/interfaces/cityzen.facilities.list.for.new.restaurant.interface';
import { CityzenLocalityListLimitedInterface } from 'src/app/interfaces/cityzen.locality.list.limited.interface';
import { CityzenSubscriptionListForRestaurantInterface } from 'src/app/interfaces/cityzen.subscription.list.for.restaurant.interface';
import { CityzenRestaurantFoodLicenseListInterface } from 'src/app/interfaces/cityzen.restaurant.food.license.list.interface';
import { DialogCityzenDeliveryTimePicker } from './dialog-cityzen-delivery-time-picker/dialog-cityzen-delivery-time-picker';
import { CityzenMediaImagesDialog } from '../../cityzen-media-images-dialog/cityzen-media-images-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-cityzen-manage-restaurant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, GoogleMapsModule],
  templateUrl: './cityzen-manage-restaurant.html',
})
export class CityzenManageRestaurant {

  action: string = 'add';
  id: string = '';
  restaurantForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    restaurantType: new FormControl('', [Validators.required]),
    locality: new FormControl<string | null>(null),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    locationType: new FormControl('Point', [Validators.required]),
    type: new FormControl('commission', [Validators.required]),
    commission: new FormControl(0, [Validators.required]),
    posOrderCommission: new FormControl(0, [Validators.required]),
    tableOrderCommission: new FormControl(0, [Validators.required]),
    subscription: new FormControl(''),
    approxDeliveryTime: new FormControl('10 to 20 min', Validators.required),
    dishPriceForTwo: new FormControl('', [Validators.required]),
    restaurantFacility: new FormControl('', [Validators.required]),
    minOrderAmount: new FormControl('', [Validators.required]),
    temporaryClosed: new FormControl(false),
    acceptScheduleDelivery: new FormControl(true),
    acceptHomeDelivery: new FormControl(true),
    pos: new FormControl(false),
    ownDriver: new FormControl(false),
    promote: new FormControl(false),
    customCategory: new FormControl(false),
    multiOutlet: new FormControl(false), // multi outlet manage
    preBooking: new FormControl(false), // advance table booking
    tableOrder: new FormControl(false), // scan the table number and order from table
    tiffinSubscription: new FormControl(false), // Subscription // Tiffin Services
    ownWaiter: new FormControl(false),
    ownKitchen: new FormControl(false),
    socialFacebook: new FormControl(''),
    socialInstagram: new FormControl(''),
    socialX: new FormControl(''),
    socialYoutube: new FormControl(''),
    socialLinkedIn: new FormControl(''),
    socialPinterest: new FormControl(''),
    takeAway: new FormControl(true), // Customer can takeaway order from restaurant
    isOutlet: new FormControl(false),
    outletManagerId: new FormControl(''),
    orderLimit: new FormControl(-1, [Validators.required]),
    productLimit: new FormControl(-1, [Validators.required]),
    logo: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    license: new FormControl(''),
    licenseId: new FormControl(''),
    translations: new FormArray([]),
    slots: new FormArray([]),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  cuisineList: Observable<CityzenCuisineListForRestaurantInterface[]>;
  listOfCuisine: CityzenCuisineListForRestaurantInterface[] = [];
  cuisineCtrl = new FormControl('');
  typeList: Observable<CityzenRestaurantTypeListForRestaurantInterface[]>;
  listOfType: CityzenRestaurantTypeListForRestaurantInterface[] = [];
  typeCtrl = new FormControl('');
  facilitiesList: Observable<CityzenFacilitiesListForNewRestaurantInterface[]>;
  listOfFacilities: CityzenFacilitiesListForNewRestaurantInterface[] = [];
  facilitiesCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  localities: Observable<CityzenLocalityListLimitedInterface[]>;
  listOfLocalities: CityzenLocalityListLimitedInterface[] = [];
  localityCtrl = new FormControl('');
  tempLocality: string = '';
  subscriptions: Observable<CityzenSubscriptionListForRestaurantInterface[]>;
  listOfSubscriptions: CityzenSubscriptionListForRestaurantInterface[] = [];
  subscriptionCtrl = new FormControl('');
  licenses: Observable<CityzenRestaurantFoodLicenseListInterface[]>;
  listOfLicenses: CityzenRestaurantFoodLicenseListInterface[] = [];
  licenseCtrl = new FormControl('');
  mapCenterLocation: google.maps.LatLng;
  mapTypeId: google.maps.MapTypeId.ROADMAP;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeId: 'roadmap'
  };
  markerPosition: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  currentBusinessType: string = '';
  showPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.getCountryCodes();
    this.restaurantForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
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

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

        if (this.action == 'add') {
          const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
          console.log(defaultCountryCode);
          this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
        }
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  getInfo() {
    console.log('get info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_deep_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.info && response.info.id == this.id) {
          const values = response.info;
          this.tempLocality = values.locality;
          this.getLocalityesWithCityId(values.city);
        }
        if (response && response.cuisine && response.cuisine.length) {
          const mappedList = response.cuisine.map(
            (item: CityzenCuisineListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfCuisine = mappedList;
          this.cuisineList = this.cuisineCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCuisine(element) : this.listOfCuisine.slice()))
          );
          const values = response.info;
          if (values && values.cuisine && values.cuisine instanceof Array) {
            const savedCuisine: string[] = values.cuisine;
            const tempCuisine: any = [];
            this.listOfCuisine.forEach((element) => {
              if (savedCuisine.includes(element.id)) {
                tempCuisine.push(element.displayName);
              }
            });
            this.restaurantForm.controls['cuisine'].patchValue(tempCuisine);
          }
          console.log(this.cuisineList);
        }

        if (response && response.types && response.types.length) {
          const mappedList = response.types.map(
            (item: CityzenRestaurantTypeListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfType = mappedList;
          this.typeList = this.typeCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantType(element) : this.listOfType.slice()))
          );
          const values = response.info;
          if (values && values.restaurantType && values.restaurantType instanceof Array) {
            const savedRestaurantType: string[] = values.restaurantType;
            const tempRestaurantType: any = [];
            this.listOfType.forEach((element) => {
              if (savedRestaurantType.includes(element.id)) {
                tempRestaurantType.push(element.displayName);
              }
            });

            this.restaurantForm.controls['restaurantType'].patchValue(tempRestaurantType);
          }
        }

        if (response && response.facilities && response.facilities.length) {
          const mappedList = response.facilities.map(
            (item: CityzenFacilitiesListForNewRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfFacilities = mappedList;
          this.facilitiesList = this.facilitiesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantFacilities(element) : this.listOfFacilities.slice()))
          );
          const values = response.info;
          if (values && values.restaurantFacility && values.restaurantFacility instanceof Array) {
            const savedRestaurantFacilities: string[] = values.restaurantFacility;
            const tempRestaurantFacilities: any = [];
            this.listOfFacilities.forEach((element) => {
              if (savedRestaurantFacilities.includes(element.id)) {
                tempRestaurantFacilities.push(element.displayName);
              }
            });

            this.restaurantForm.controls['restaurantFacility'].patchValue(tempRestaurantFacilities);
          }
        }

        if (response && response.subscription && response.subscription.length) {
          const mappedList = response.subscription.map(
            (item: CityzenSubscriptionListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
                item.displayShortDescription = translation?.shortDescriptions || item.shortDescriptions;
              } else {
                item.displayName = item?.name || '';
                item.displayShortDescription = item?.shortDescriptions || '';
              }
              return item;
            }
          );
          this.listOfSubscriptions = mappedList;
          this.subscriptions = this.subscriptionCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterSubscription(element) : this.listOfSubscriptions.slice()))
          );
          const values = response.info;
          if (values && values.subscription && values.subscription != '' && values.subscription != null) {
            this.restaurantForm.controls['subscription'].setValue(values.subscription);
            this.subscriptionCtrl.setValue(values.subscription);
          }
        }

        if (response && response.licenses && response.licenses.length) {
          this.listOfLicenses = response.licenses;
          this.licenses = this.licenseCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterLicense(element) : this.listOfLicenses.slice()))
          );
          const values = response.info;
          if (values && values.license && values.license != '' && values.license != null) {
            this.restaurantForm.controls['license'].setValue(values.license);
            this.licenseCtrl.setValue(values.license);
            this.restaurantForm.controls['licenseId'].setValue(values.licenseId);
          }
        }

        if (response && response.info && response.info.id == this.id) {
          const values = response.info;
          this.currentBusinessType = values.type;
          this.restaurantForm.controls['name'].setValue(values.name);
          this.restaurantForm.controls['address'].setValue(values.address);
          this.restaurantForm.controls['shortDescription'].setValue(values.shortDescription);
          this.restaurantForm.controls['logo'].setValue(values.logo);
          this.restaurantForm.controls['cover'].setValue(values.cover);
          this.restaurantForm.controls['dishPriceForTwo'].setValue(values.dishPriceForTwo);
          this.restaurantForm.controls['approxDeliveryTime'].setValue(values.approxDeliveryTime);
          this.restaurantForm.controls['type'].setValue(values.type);
          this.restaurantForm.controls['orderLimit'].setValue(values.orderLimit);
          this.restaurantForm.controls['commission'].setValue(values.commission);
          this.restaurantForm.controls['posOrderCommission'].setValue(values.posOrderCommission);
          this.restaurantForm.controls['tableOrderCommission'].setValue(values.tableOrderCommission);
          this.restaurantForm.controls['productLimit'].setValue(values.productLimit);
          this.restaurantForm.controls['isOutlet'].setValue(values.isOutlet);

          this.restaurantForm.controls['temporaryClosed'].setValue(values.temporaryClosed);
          this.restaurantForm.controls['acceptScheduleDelivery'].setValue(values.acceptScheduleDelivery);
          this.restaurantForm.controls['acceptHomeDelivery'].setValue(values.acceptHomeDelivery);
          this.restaurantForm.controls['minOrderAmount'].setValue(values.minOrderAmount);

          this.restaurantForm.controls['socialFacebook'].setValue(values.socialFacebook);
          this.restaurantForm.controls['socialInstagram'].setValue(values.socialInstagram);
          this.restaurantForm.controls['socialX'].setValue(values.socialX);
          this.restaurantForm.controls['socialYoutube'].setValue(values.socialYoutube);
          this.restaurantForm.controls['socialLinkedIn'].setValue(values.socialLinkedIn);
          this.restaurantForm.controls['socialPinterest'].setValue(values.socialPinterest);

          if (values && values.translations && values.translations instanceof Array) {
            this.translations = values.translations;
            this.locale();
          }
          (this.restaurantForm as any).removeControl('firstName');
          (this.restaurantForm as any).removeControl('lastName');
          (this.restaurantForm as any).removeControl('mobile');
          (this.restaurantForm as any).removeControl('email');
          (this.restaurantForm as any).removeControl('password');
          (this.restaurantForm as any).removeControl('countryCode');

          if (values && values.location && values.location.coordinates && values.location.coordinates.length && values.location.coordinates.length == 2) {
            this.restaurantForm.controls['latitude'].setValue(values.location.coordinates[1]);
            this.restaurantForm.controls['longitude'].setValue(values.location.coordinates[0]);
            this.mapCenterLocation = new google.maps.LatLng(values.location.coordinates[1], values.location.coordinates[0]);
            this.markerPosition = { lat: values.location.coordinates[1], lng: values.location.coordinates[0] };
          }
          this.restaurantForm.controls['takeAway'].setValue(values.takeAway);
          const customCategory = values && values.customCategory ? true : false;
          const ownDriver = values && values.ownDriver ? true : false;
          const pos = values && values.pos ? true : false;
          const promote = values && values.promote ? true : false;
          const multiOutlet = values && values.multiOutlet ? true : false;
          const preBooking = values && values.preBooking ? true : false;
          const tableOrder = values && values.tableOrder ? true : false;
          const tiffinSubscription = values && values.tiffinSubscription ? true : false;
          const ownWaiter = values && values.ownWaiter ? true : false;
          const ownKitchen = values && values.ownKitchen ? true : false;
          console.log(customCategory, ownDriver, pos, promote, multiOutlet, preBooking, tableOrder, tiffinSubscription, ownWaiter, ownKitchen);
          this.restaurantForm.controls['customCategory'].setValue(customCategory);
          this.restaurantForm.controls['ownDriver'].setValue(ownDriver);
          this.restaurantForm.controls['pos'].setValue(pos == true);
          this.restaurantForm.controls['promote'].setValue(promote == true);
          this.restaurantForm.controls['multiOutlet'].setValue(multiOutlet == true);
          this.restaurantForm.controls['preBooking'].setValue(preBooking == true);
          this.restaurantForm.controls['tableOrder'].setValue(tableOrder == true);
          this.restaurantForm.controls['tiffinSubscription'].setValue(tiffinSubscription == true);
          this.restaurantForm.controls['ownWaiter'].setValue(ownWaiter == true);
          this.restaurantForm.controls['ownKitchen'].setValue(ownKitchen == true);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  getBasicData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/basic_data_for_new_restaurant/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.cityzen && response.cityzen.city != '' && response.cityzen.city != null) {
          this.getLocalityesWithCityId(response.cityzen.city);
        }

        if (response && response.cuisine && response.cuisine.length) {
          const mappedList = response.cuisine.map(
            (item: CityzenCuisineListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfCuisine = mappedList;
          this.cuisineList = this.cuisineCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCuisine(element) : this.listOfCuisine.slice()))
          );
          console.log(this.listOfCuisine);
        }


        if (response && response.types && response.types.length) {
          const mappedList = response.types.map(
            (item: CityzenRestaurantTypeListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfType = mappedList;
          this.typeList = this.typeCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantType(element) : this.listOfType.slice()))
          );
          console.log(this.listOfType);
        }

        if (response && response.facilities && response.facilities.length) {
          const mappedList = response.facilities.map(
            (item: CityzenFacilitiesListForNewRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfFacilities = mappedList;
          this.facilitiesList = this.facilitiesCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterRestaurantFacilities(element) : this.listOfFacilities.slice()))
          );
          console.log(this.listOfFacilities);
        }

        if (response && response.subscription && response.subscription.length) {
          const mappedList = response.subscription.map(
            (item: CityzenSubscriptionListForRestaurantInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
                item.displayShortDescription = translation?.shortDescriptions || item.shortDescriptions;
              } else {
                item.displayName = item?.name || '';
                item.displayShortDescription = item?.shortDescriptions || '';
              }
              return item;
            }
          );
          this.listOfSubscriptions = mappedList;
          this.subscriptions = this.subscriptionCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterSubscription(element) : this.listOfSubscriptions.slice()))
          );
        }

        if (response && response.licenses && response.licenses.length) {
          this.listOfLicenses = response.licenses;
          this.licenses = this.licenseCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterLicense(element) : this.listOfLicenses.slice()))
          );
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterCuisine(value: string): CityzenCuisineListForRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCuisine.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantType(value: string): CityzenRestaurantTypeListForRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfType.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantFacilities(value: string): CityzenFacilitiesListForNewRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfFacilities.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterSubscription(value: string): CityzenSubscriptionListForRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfSubscriptions.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterLicense(value: string): CityzenRestaurantFoodLicenseListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLicenses.filter((element) =>
      this.getTranslatedLicenseName(element).toLowerCase().includes(filterValue)
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
          address: '',
          shortDescription: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
            locale.address = translate.address;
            locale.shortDescription = translate.shortDescription;
          }
        });
      });
    }
  }

  onSubmit() {
    console.log('submit');
    console.log(this.action);
    this.haveSubmitClicked = true;
    const locale = this.restaurantForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], address: [element.address], shortDescription: [element.shortDescription] }));
    });
    console.log(this.restaurantForm.getRawValue());
    if (this.restaurantForm.valid) {
      console.log('on submit');
      if (this.action == 'add') {
        this.saveRestaurant();
      } else {
        console.log(this.currentBusinessType, this.restaurantForm.controls['type'].value);
        if (this.currentBusinessType != this.restaurantForm.controls['type'].value) {
          console.log('show dialog');
          const dialogRef = this.dialog.open(ConfirmDialog, {
            data: { title: 'ts_restaurant_business_model_change', subTitle: `${this.util.appTranslate('ts_business_model_updated_to_one')} ${this.restaurantForm.controls['type'].value} ${this.util.appTranslate('ts_business_model_updated_to_two')}`, okTitle: 'ts_yes_change_it', closeTitle: 'ts_cancel' },
            disableClose: true
          });
          dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
            if (result && result.action && result.action == "confirm") {
              this.updateRestaurant();
            }
          });
        } else {
          this.updateRestaurant();
        }
      }
    }
  }

  saveRestaurant() {
    console.log('on save');
    console.log(this.markerPosition);
    console.log(this.restaurantForm);
    console.log(this.restaurantForm.value);
    const sendData = this.restaurantForm.getRawValue();
    const cuisineIds: any[] = [];
    this.listOfCuisine.forEach((element) => {
      if (sendData.cuisine && sendData.cuisine.includes(element.displayName)) {
        cuisineIds.push(element.id);
      }
    });
    sendData.cuisine = cuisineIds.join();

    const typeIds: any[] = [];
    this.listOfType.forEach((element) => {
      if (sendData.restaurantType && sendData.restaurantType.includes(element.displayName)) {
        typeIds.push(element.id);
      }
    });
    sendData.restaurantType = typeIds.join();

    const facilitiesIds: any[] = [];
    this.listOfFacilities.forEach((element) => {
      if (sendData.restaurantFacility && sendData.restaurantFacility.includes(element.displayName)) {
        facilitiesIds.push(element.id);
      }
    });
    sendData.restaurantFacility = facilitiesIds.join();

    const selectedLocality = this.listOfLocalities.filter(x => x.id == this.restaurantForm.value.locality);
    console.log(selectedLocality);
    if (selectedLocality && selectedLocality.length > 0) {
      sendData.locality = selectedLocality[0].id;
    } else {
      sendData.locality = null;
    }

    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/cityzen/create_restaurant/' + this.util.getItem('_uid'), sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_restaurant_added');
        this.router.navigate(['cityzen-team/restaurant-section/restaurants']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  updateRestaurant() {
    console.log('on update');
    console.log(this.markerPosition);
    console.log(this.restaurantForm);
    console.log(this.restaurantForm.value);
    const sendData = this.restaurantForm.getRawValue();
    const cuisineIds: any[] = [];
    this.listOfCuisine.forEach((element) => {
      if (sendData.cuisine && sendData.cuisine.includes(element.displayName)) {
        cuisineIds.push(element.id);
      }
    });
    sendData.cuisine = cuisineIds.join();

    const typeIds: any[] = [];
    this.listOfType.forEach((element) => {
      if (sendData.restaurantType && sendData.restaurantType.includes(element.displayName)) {
        typeIds.push(element.id);
      }
    });
    sendData.restaurantType = typeIds.join();

    const facilitiesIds: any[] = [];
    this.listOfFacilities.forEach((element) => {
      if (sendData.restaurantFacility && sendData.restaurantFacility.includes(element.displayName)) {
        facilitiesIds.push(element.id);
      }
    });
    sendData.restaurantFacility = facilitiesIds.join();

    const selectedLocality = this.listOfLocalities.filter(x => x.id == this.restaurantForm.value.locality);
    console.log(selectedLocality);
    if (selectedLocality && selectedLocality.length > 0) {
      sendData.locality = selectedLocality[0].id;
    } else {
      sendData.locality = null;
    }

    console.log(sendData);
    const spinnerRef = this.util.start('ts_updating');
    this.api.patch_private('v1/cityzen/update_restaurant_detail/' + this.id + '/' + this.util.getItem('_uid'), sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_restaurant_updated');
        this.router.navigate(['cityzen-team/restaurant-section/restaurants']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.restaurantForm.patchValue({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      countryCode: '',
      mobile: '',
      name: '',
      address: '',
      shortDescription: '',
      cuisine: '',
      restaurantType: '',
      locality: null,
      locationType: 'Point',
      type: 'commission',
      commission: 0,
      posOrderCommission: 0,
      tableOrderCommission: 0,
      subscription: '',
      approxDeliveryTime: '10 to 20 min',
      dishPriceForTwo: '',
      restaurantFacility: '',
      minOrderAmount: '',
      temporaryClosed: false,
      acceptScheduleDelivery: true,
      acceptHomeDelivery: true,
      pos: false,
      ownDriver: false,
      promote: false,
      customCategory: false,
      multiOutlet: false,
      preBooking: false,
      tableOrder: false,
      tiffinSubscription: false,
      ownWaiter: false,
      ownKitchen: false,
      socialFacebook: '',
      socialInstagram: '',
      socialX: '',
      socialYoutube: '',
      socialLinkedIn: '',
      socialPinterest: '',
      takeAway: true,
      isOutlet: false,
      outletManagerId: '',
      orderLimit: -1,
      productLimit: -1,
      logo: '',
      cover: '',
      license: '',
      licenseId: ''
    });

    this.restaurantForm.get('latitude')?.reset(0);
    this.restaurantForm.get('latitude')?.disable();

    this.restaurantForm.get('longitude')?.reset(0);
    this.restaurantForm.get('longitude')?.disable();

    (this.restaurantForm.get('translations') as FormArray).clear();
    (this.restaurantForm.get('slots') as FormArray).clear();

    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.address = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;
    this.haveSubmitClicked = false;
    console.log(this.restaurantForm.getRawValue());
  }

  get f() {
    return this.restaurantForm.controls;
  }

  openedChange(e: any) {
    this.cuisineCtrl.patchValue('');
  }

  typeOpenedChange(e: any) {
    this.typeCtrl.patchValue('');
  }

  facilitiesOpenedChange(e: any) {
    this.facilitiesCtrl.patchValue('');
  }

  onDeliveryTimePicker() {
    console.log('open time picker');
    console.log(this.restaurantForm);
    const dialogRef = this.dialog.open(DialogCityzenDeliveryTimePicker, {
      data: { value: this.restaurantForm.controls['approxDeliveryTime'].value },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'ok' && result.data.max && result.data.min && result.data.type) {
        this.restaurantForm.controls['approxDeliveryTime'].setValue(result.data.min + ' ' + 'to' + ' ' + result.data.max + ' ' + result.data.type);
      }
    });
  }

  getLocalityesWithCityId(id: string) {
    this.api.get_private('v1/cityzen/localities_from_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.listOfLocalities = response;
        this.localities = this.localityCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterLocality(element) : this.listOfLocalities.slice()))
        );
        if (this.action == 'edit' && this.tempLocality && this.tempLocality != null) {
          this.restaurantForm.controls['locality'].setValue(this.tempLocality);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterLocality(value: string): CityzenLocalityListLimitedInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLocalities.filter((element) =>
      this.getTranslatedLocalityName(element).toLowerCase().includes(filterValue)
    );
  }

  onLocalitySelect(event: any) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['locality'].setValue(event.option.value);
      const selectedLocality = this.listOfLocalities.filter(x => x.id == event.option.value);
      if (selectedLocality && selectedLocality.length && selectedLocality.length > 0) {
        this.mapCenterLocation = new google.maps.LatLng(selectedLocality[0].location.coordinates[1], selectedLocality[0].location.coordinates[0]);
        this.markerPosition = { lat: selectedLocality[0].location.coordinates[1], lng: selectedLocality[0].location.coordinates[0] };
        this.setRestaurantLocation();
      }
    }
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setRestaurantLocation();
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setRestaurantLocation();
    }
  }

  setRestaurantLocation() {
    this.restaurantForm.controls['latitude'].setValue(this.markerPosition.lat);
    this.restaurantForm.controls['longitude'].setValue(this.markerPosition.lng);
  }

  onTypeChange(event: MatRadioChange) {
    console.log(event);
    if (event.value == 'commission') {
      this.restaurantForm.controls['commission'].setValidators([Validators.required]);
      this.restaurantForm.controls['subscription'].clearValidators();
      this.restaurantForm.controls['subscription'].setValue('');
    } else if (event.value == 'subscription') {
      this.restaurantForm.controls['subscription'].setValidators([Validators.required]);
      this.restaurantForm.controls['commission'].clearValidators();
      this.restaurantForm.controls['commission'].setValue(0);
    }
  }

  onOrderLimitChange(type: string) {
    console.log(type);
    if (type != 'unlimited') {
      console.log('custome');
      this.restaurantForm.controls['orderLimit'].setValue(500);
    } else {
      console.log('unlimited');
      this.restaurantForm.controls['orderLimit'].setValue(-1);
    }
  }

  onProductLimitChange(type: string) {
    console.log(type);
    if (type != 'unlimited') {
      console.log('custome');
      this.restaurantForm.controls['productLimit'].setValue(100);
    } else {
      console.log('unlimited');
      this.restaurantForm.controls['productLimit'].setValue(-1);
    }
  }

  onSubscriptionSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['subscription'].setValue(event.option.value);
      const selectedSubscriptions = this.listOfSubscriptions.filter(x => x.id == event.option.value);
      console.log(selectedSubscriptions);
      if (selectedSubscriptions && selectedSubscriptions.length > 0) {
        const response = selectedSubscriptions[0];
        const customCategory = response && response.customCategory ? true : false;
        const ownDriver = response && response.ownDriver ? true : false;
        const pos = response && response.pos ? true : false;
        const promote = response && response.promote ? true : false;
        const multiOutlet = response && response.multiOutlet ? true : false;
        const preBooking = response && response.preBooking ? true : false;
        const tableOrder = response && response.tableOrder ? true : false;
        const tiffinSubscription = response && response.tiffinSubscription ? true : false;
        const ownWaiter = response && response.ownWaiter ? true : false;
        const ownKitchen = response && response.ownKitchen ? true : false;
        console.log(customCategory, ownDriver, pos, promote, multiOutlet, preBooking, tableOrder);
        this.restaurantForm.controls['customCategory'].setValue(customCategory);
        this.restaurantForm.controls['ownDriver'].setValue(ownDriver);
        this.restaurantForm.controls['pos'].setValue(pos);
        this.restaurantForm.controls['promote'].setValue(promote);
        this.restaurantForm.controls['multiOutlet'].setValue(multiOutlet);
        this.restaurantForm.controls['preBooking'].setValue(preBooking);
        this.restaurantForm.controls['tableOrder'].setValue(tableOrder);
        this.restaurantForm.controls['tiffinSubscription'].setValue(tiffinSubscription);
        this.restaurantForm.controls['ownWaiter'].setValue(ownWaiter);
        this.restaurantForm.controls['ownKitchen'].setValue(ownKitchen);
        this.restaurantForm.controls['orderLimit'].setValue(response.orderLimit);
        this.restaurantForm.controls['productLimit'].setValue(response.productLimit);
        this.restaurantForm.controls['commission'].setValue(response.commission);
      }
    }
  }

  onImageClick(formName: string) {
    console.log('on image click for ', formName);
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
      data: { value: '' },
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
        if (formName == 'logo') {
          this.restaurantForm.controls['logo'].setValue(result.data);
        } else {
          this.restaurantForm.controls['cover'].setValue(result.data);
        }
      }
    });
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.restaurantForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onLicenseSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['license'].setValue(event.option.value);
    }
  }

  getTranslatedLocalityName(item: CityzenLocalityListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayLocalityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfLocalities.find(item => item.id == id);
    return selected ? this.getTranslatedLocalityName(selected) : '';
  };

  getTranslatedLicenseName(item: CityzenRestaurantFoodLicenseListInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayLicenseName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfLicenses.find(item => item.id == id);
    return selected ? this.getTranslatedLicenseName(selected) : '';
  };


  getTranslatedSubscriptionName(item: CityzenSubscriptionListForRestaurantInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.title) {
        return found.title;
      }
    }
    return item.name;
  }

  displaySubscriptionName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfSubscriptions.find(item => item.id == id);
    return selected ? this.getTranslatedSubscriptionName(selected) : '';
  };

}
