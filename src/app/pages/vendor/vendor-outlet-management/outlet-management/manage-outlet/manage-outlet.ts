import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { VendorCitiesListForOutletInterface } from 'src/app/interfaces/vendor.cities.list.for.outlet.interface';
import { VendorCuisineListForOutletInterface } from 'src/app/interfaces/vendor.cuisine.list.for.outlet.interface';
import { VendorFacilitiesListForRestaurantInterface } from 'src/app/interfaces/vendor.facilities.list.for.outlet.interface';
import { VendorLicenseListForOutletInterface } from 'src/app/interfaces/vendor.license.list.for.outlet.interface';
import { VendorLocalityListInterface } from 'src/app/interfaces/vendor.locality.list.interface';
import { VendorRestaurantTypeListForNewOutletInterface } from 'src/app/interfaces/vendor.restaurant.type.list.for.new.outlet.interface';
import { DialogDeliveryTimePicker } from 'src/app/pages/admin/restaurant-management/restaurants/manage-restaurant/dialog-delivery-time-picker/dialog-delivery-time-picker';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-manage-outlet',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, GoogleMapsModule],
  templateUrl: './manage-outlet.html',
})
export class ManageOutlet {

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
    managerId: new FormControl(''),
    address: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    restaurantType: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    locality: new FormControl<string | null>(null),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    approxDeliveryTime: new FormControl('10 to 20 min', Validators.required),
    dishPriceForTwo: new FormControl('', [Validators.required]),
    restaurantFacility: new FormControl('', [Validators.required]),
    minOrderAmount: new FormControl('', [Validators.required]),
    acceptScheduleDelivery: new FormControl(true),
    acceptHomeDelivery: new FormControl(true),
    takeAway: new FormControl(true), // Customer can takeaway order from restaurant
    logo: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    license: new FormControl(''),
    licenseId: new FormControl(''),
    socialFacebook: new FormControl(''),
    socialInstagram: new FormControl(''),
    socialX: new FormControl(''),
    socialYoutube: new FormControl(''),
    socialLinkedIn: new FormControl(''),
    socialPinterest: new FormControl(''),
    translations: new FormArray([]),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  cuisineList: Observable<VendorCuisineListForOutletInterface[]>;
  listOfCuisine: VendorCuisineListForOutletInterface[] = [];
  cuisineCtrl = new FormControl('');
  typeList: Observable<VendorRestaurantTypeListForNewOutletInterface[]>;
  listOfType: VendorRestaurantTypeListForNewOutletInterface[] = [];
  typeCtrl = new FormControl('');
  facilitiesList: Observable<VendorFacilitiesListForRestaurantInterface[]>;
  listOfFacilities: VendorFacilitiesListForRestaurantInterface[] = [];
  facilitiesCtrl = new FormControl('');
  cities: Observable<VendorCitiesListForOutletInterface[]>;
  listOfCities: VendorCitiesListForOutletInterface[] = [];
  cityCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  localities: Observable<VendorLocalityListInterface[]>;
  listOfLocalities: VendorLocalityListInterface[] = [];
  localityCtrl = new FormControl('');
  tempLocality: string = '';
  licenses: Observable<VendorLicenseListForOutletInterface[]>;
  listOfLicenses: VendorLicenseListForOutletInterface[] = [];
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
  showPassword: boolean = true;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.restaurantForm.controls['managerId'].setValue(this.util.getItem('_vendorId'));
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
    this.api.get_private('v1/vendor_web/outlet/getById/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
          if (response && response.info && response.info.id == this.id) {
            const values = response.info;
            this.tempLocality = values.locality;
            this.getLocalityesWithCityId(values.city);
            this.restaurantForm.controls['city'].setValue(values.city);
          }
        }

        if (response && response.cuisine && response.cuisine.length) {
          const mappedList = response.cuisine.map(
            (item: VendorCuisineListForOutletInterface) => {
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
          this.restaurantForm.controls['takeAway'].setValue(values.takeAway);
          if (values && values.cuisine && values.cuisine instanceof Array) {
            console.log('have cuisine array');
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
            (item: VendorRestaurantTypeListForNewOutletInterface) => {
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
            console.log('have restaurantType array');
            const savedRestaurantType: string[] = values.restaurantType;
            const tempRestaurantType: any = [];
            this.listOfType.forEach((element) => {
              if (savedRestaurantType.includes(element.id)) {
                tempRestaurantType.push(element.displayName);
              }
            });

            this.restaurantForm.controls['restaurantType'].patchValue(tempRestaurantType);
          }
          console.log(this.typeList);
        }


        if (response && response.facilities && response.facilities.length) {
          const mappedList = response.facilities.map(
            (item: VendorFacilitiesListForRestaurantInterface) => {
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
            console.log('have restaurantFacility array');
            const savedRestaurantFacilities: string[] = values.restaurantFacility;
            const tempRestaurantFacilities: any = [];
            this.listOfFacilities.forEach((element) => {
              if (savedRestaurantFacilities.includes(element.id)) {
                tempRestaurantFacilities.push(element.displayName);
              }
            });

            this.restaurantForm.controls['restaurantFacility'].patchValue(tempRestaurantFacilities);
          }
          console.log(this.typeList);
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
            console.log('********************************');
            console.log(values);
            console.log('********************************');

          }
        }

        if (response && response.info && response.info.id == this.id) {
          const values = response.info;
          this.restaurantForm.controls['name'].setValue(values.name);
          this.restaurantForm.controls['address'].setValue(values.address);
          this.restaurantForm.controls['shortDescription'].setValue(values.shortDescription);
          this.restaurantForm.controls['logo'].setValue(values.logo);
          this.restaurantForm.controls['cover'].setValue(values.cover);
          this.restaurantForm.controls['dishPriceForTwo'].setValue(values.dishPriceForTwo);
          this.restaurantForm.controls['approxDeliveryTime'].setValue(values.approxDeliveryTime);
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

        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterLicense(value: string): VendorLicenseListForOutletInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLicenses.filter((element) =>
      this.getTranslatedLicenseName(element).toLowerCase().includes(filterValue)
    );
  }

  getBasicData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/outlet/getBasicDataForNewOutlet').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }

        if (response && response.cuisine && response.cuisine.length) {
          const mappedList = response.cuisine.map(
            (item: VendorCuisineListForOutletInterface) => {
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
            (item: VendorRestaurantTypeListForNewOutletInterface) => {
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
            (item: VendorFacilitiesListForRestaurantInterface) => {
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterCities(value: string): VendorCitiesListForOutletInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  private _filterCuisine(value: string): VendorCuisineListForOutletInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCuisine.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantType(value: string): VendorRestaurantTypeListForNewOutletInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfType.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantFacilities(value: string): VendorFacilitiesListForRestaurantInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfFacilities.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
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
        this.updateRestaurant();
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
    this.api.post_private('v1/vendor_web/outlet/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_outlet_added');
        this.router.navigate(['vendor/outlet-management/list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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
    this.api.patch_private('v1/vendor_web/outlet/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_outlet_updated');
        this.router.navigate(['vendor/outlet-management/list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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
      approxDeliveryTime: '10 to 20 min',
      dishPriceForTwo: '',
      restaurantFacility: '',
      minOrderAmount: '',
      acceptScheduleDelivery: true,
      acceptHomeDelivery: true,
      socialFacebook: '',
      socialInstagram: '',
      socialX: '',
      socialYoutube: '',
      socialLinkedIn: '',
      socialPinterest: '',
      takeAway: true,
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

  selectionChange(event: MatOptionSelectionChange) {
    console.log(event);
    console.log(this.restaurantForm);
  }

  onDeliveryTimePicker() {
    console.log('open time picker');
    console.log(this.restaurantForm);
    const dialogRef = this.dialog.open(DialogDeliveryTimePicker, {
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

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['city'].setValue(event.option.value);
      this.restaurantForm.controls['locality'].setValue('');
      const selectedCity = this.listOfCities.filter(x => x.id == this.restaurantForm.value.city);
      if (selectedCity && selectedCity.length && selectedCity.length > 0) {
        this.mapCenterLocation = new google.maps.LatLng(selectedCity[0].location.coordinates[1], selectedCity[0].location.coordinates[0]);
        this.markerPosition = { lat: selectedCity[0].location.coordinates[1], lng: selectedCity[0].location.coordinates[0] };
        this.setRestaurantLocation();
        this.getLocalityesWithCityId(selectedCity[0].id);
      }
    }
  }

  getLocalityesWithCityId(id: string) {
    this.api.get_private('v1/vendor_web/localities/getByCityId/' + id).subscribe({
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterLocality(value: string): VendorLocalityListInterface[] {
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

  onImageClick(formName: string) {
    console.log('on image click for ', formName);
    const dialogRef = this.dialog.open(SelectVendorMediaDialog, {
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

  getTranslatedCityName(item: VendorCitiesListForOutletInterface): string {
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

  getTranslatedLicenseName(item: VendorLicenseListForOutletInterface): string {
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

  getTranslatedLocalityName(item: VendorLocalityListInterface): string {
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

}
