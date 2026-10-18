import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, of, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { CustomerCitiesListInterface } from 'src/app/interfaces/customer.cities.list.interface';
import { CustomerJoiningFormChecboxItemInterface, CustomerJoiningFormRequestInterface } from 'src/app/interfaces/customer.joining.form.request.interface';
import { CustomerLocalityListInterface } from 'src/app/interfaces/customer.locality.list.interface';
import { CustomerJoiningFormResponseInterface } from 'src/app/interfaces/customer.joining.form.response.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CustomerCuisineListInterface } from 'src/app/interfaces/customer.cuisine.list.interface';
import { CustomerRestaurantTypeInterface } from 'src/app/interfaces/customer.restaurant.type.interface';
import { CustomerRestaurantFacilitiesInterface } from 'src/app/interfaces/customer.restaurant.facilities.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogRestaurantSelfRegisterDeliveryTimePicker } from './dialog-restaurant-self-register-delivery-time-picker/dialog-restaurant-self-register-delivery-time-picker';
import { RestaurantFoodLicenseListInterface } from 'src/app/interfaces/restaurant.food.license.list.interface';
import { CustomerVendorSubscriptionPackageInterface } from 'src/app/interfaces/customer.vendor.subscription.package.interface';
import { CustomerSubscriptionPaymentInterface } from 'src/app/interfaces/customer.subscription.payment.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-restaurant-register-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, GoogleMapsModule, NgIcon],
  templateUrl: './restaurant-register-request.html',
})
export class RestaurantRegisterRequest {

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;
  isLoading: boolean = false;
  haveSubmitClicked: boolean = false;
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
    city: new FormControl('', [Validators.required]),
    locality: new FormControl<string | null>(null),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    locationType: new FormControl('Point', [Validators.required]),
    businessType: new FormControl('commission', [Validators.required]),
    subscriptionId: new FormControl(''),
    approxDeliveryTime: new FormControl('10 to 20 min', Validators.required),
    dishPriceForTwo: new FormControl('', [Validators.required]),
    restaurantFacility: new FormControl('', [Validators.required]),
    minOrderAmount: new FormControl('', [Validators.required]),
    acceptScheduleDelivery: new FormControl(true),
    acceptHomeDelivery: new FormControl(true),
    socialFacebook: new FormControl(''),
    socialInstagram: new FormControl(''),
    socialX: new FormControl(''),
    socialYoutube: new FormControl(''),
    socialLinkedIn: new FormControl(''),
    socialPinterest: new FormControl(''),
    takeAway: new FormControl(true),
    logo: new FormControl('', [Validators.required]),
    cover: new FormControl('', [Validators.required]),
    license: new FormControl(''),
    licenseId: new FormControl(''),
    translations: new FormArray([]),
  });
  languages: any[] = [];
  translations: any[] = [];
  cities: Observable<CustomerCitiesListInterface[]>;
  listOfCities: CustomerCitiesListInterface[] = [];
  cityCtrl = new FormControl('');
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  localities: Observable<CustomerLocalityListInterface[]>;
  listOfLocalities: CustomerLocalityListInterface[] = [];
  localityCtrl = new FormControl('');
  cuisineList: Observable<CustomerCuisineListInterface[]>;
  listOfCuisine: CustomerCuisineListInterface[] = [];
  cuisineCtrl = new FormControl('');
  typeList: Observable<CustomerRestaurantTypeInterface[]>;
  listOfType: CustomerRestaurantTypeInterface[] = [];
  typeCtrl = new FormControl('');
  facilitiesList: Observable<CustomerRestaurantFacilitiesInterface[]>;
  listOfFacilities: CustomerRestaurantFacilitiesInterface[] = [];
  facilitiesCtrl = new FormControl('');
  licenses: Observable<RestaurantFoodLicenseListInterface[]>;
  listOfLicenses: RestaurantFoodLicenseListInterface[] = [];
  licenseCtrl = new FormControl('');
  subscriptionPackages: CustomerVendorSubscriptionPackageInterface[] = [];
  payAmount: number = 0;
  paymentList: CustomerSubscriptionPaymentInterface[] = [];
  haveTrial: boolean = false;
  trialPeriod: number = 0;
  paymentId: string = '';
  showPassword: boolean = true;
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
  joininFormField: CustomerJoiningFormRequestInterface[] = [];
  coverFileURL: any = 'assets/images/placeholder.png';
  coverFileTarget: any;
  logoFileURL: any = 'assets/images/placeholder.png';
  logoFileTarget: any;
  currentIndex: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.locale();
    this.getBasicDetail();
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

  getBasicDetail() {
    this.isLoading = true;
    this.api.get_private('v1/public/register/restaurant_web_self_register_detail/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoading = false;

        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCities(element) : this.listOfCities.slice()))
          );
        }

        if (response && response.joiningForm && response.joiningForm.result && response.joiningForm.result.restaurantForm && Array.isArray(response.joiningForm.result.restaurantForm) && response.joiningForm.result.restaurantForm.length > 0) {
          const mappedList = response.joiningForm.result.restaurantForm.map((item: CustomerJoiningFormResponseInterface) => {
            const mappedCheckbox = item.items?.map((checkbox) => {
              const obj: CustomerJoiningFormChecboxItemInterface = {
                name: checkbox.name,
                value: false
              }
              return obj;
            });

            const obj: CustomerJoiningFormRequestInterface = {
              uuid: item.uuid,
              isRequired: item.isRequired,
              type: item.type,
              title: item.title,
              placeholder: item.placeholder,
              value: '',
              extraValue: item.type == 'phone' ? this.api.defaultCountryCode : '',
              fileURL: item.type == 'file' ? 'assets/images/placeholder.png' : '',
              fileTarget: undefined,
              items: mappedCheckbox && Array.isArray(mappedCheckbox) && mappedCheckbox.length > 0 ? mappedCheckbox : []
            }
            return obj;
          });
          const sortMapped = mappedList.sort((a: CustomerJoiningFormRequestInterface, b: CustomerJoiningFormRequestInterface) => {
            const order: Record<string, number> = {
              choose: 1,
              file: 2,
            };

            const aOrder = order[a.type] ?? 0;
            const bOrder = order[b.type] ?? 0;

            return aOrder - bOrder;
          });
          this.joininFormField = sortMapped;
          console.log(this.joininFormField);
        }

        if (response && response.cuisine && Array.isArray(response.cuisine) && response.cuisine.length) {
          const mappedList = response.cuisine.map(
            (item: CustomerCuisineListInterface) => {
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
        }

        if (response && response.types && Array.isArray(response.types) && response.types.length) {
          const mappedList = response.types.map(
            (item: CustomerRestaurantTypeInterface) => {
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
        }

        if (response && response.facilities && Array.isArray(response.facilities) && response.facilities.length) {
          const mappedList = response.facilities.map(
            (item: CustomerRestaurantFacilitiesInterface) => {
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
        }

        if (response && response.licenses && Array.isArray(response.licenses) && response.licenses.length) {
          this.listOfLicenses = response.licenses;
          this.licenses = this.licenseCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterLicense(element) : this.listOfLicenses.slice()))
          );
        }

        if (response && response.subscriptionPackages && Array.isArray(response.subscriptionPackages) && response.subscriptionPackages.length) {
          const mappedList = response.subscriptionPackages.map(
            (item: CustomerVendorSubscriptionPackageInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              item.discountPrice = 0;
              if (item && item.discount && parseFloat(item.discount.toString()) > 0) {
                const discountValue = (parseFloat(item.price.toString()) - (parseFloat(item.price.toString()) * parseFloat(item.discount.toString()) / 100)).toFixed(2);
                item.discountPrice = parseFloat(discountValue);
              }
              console.log(`${item.price} ${item.discount} ${item.discountPrice}`);
              return item;
            }
          );
          this.subscriptionPackages = mappedList;
          if (this.subscriptionPackages.length > 0) {
            this.restaurantForm.controls['subscriptionId'].setValue(this.subscriptionPackages[0].id);
            this.payAmount = this.subscriptionPackages[0].discount > 0 ? this.subscriptionPackages[0].discountPrice : this.subscriptionPackages[0].price;
            if (this.subscriptionPackages[0].haveTrial) {
              this.haveTrial = true;
              this.trialPeriod = this.subscriptionPackages[0].trialValidity;
              this.paymentId = 'trial';
            }
          }
          console.log(this.subscriptionPackages);
        }

        if (response && response.payment && response.payment.payments && Array.isArray(response.payment.payments) && response.payment.payments.length) {
          const mappedList = response.payment.payments.map(
            (item: CustomerSubscriptionPaymentInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.paymentList = mappedList;
          if (this.haveTrial == false && response && response.payment && response.payment.primary && response.payment.primary.id && response.payment.primary.id != '') {
            console.log('OOKK1');
            this.paymentId = response.payment.primary.id;
          } else if (this.haveTrial == false && this.paymentList.length > 0) {
            console.log('OOKK2');
            this.paymentId = this.paymentList[0].id;
          }
        }

        console.log(this.paymentList);
        this.getCountryCodes();
        this.restaurantForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
      }, error: (error: any) => {
        this.isLoading = false;
        console.log(error);
        this.util.handleError(error, 'public');
      }
    });
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
        console.log(defaultCountryCode);
        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
        this.joininFormField.forEach((element) => {
          if (element.type == 'phone') {
            const num = this.api.defaultCountryCode.replace('+', '');
            element.extraValue = num;
          }
        });
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterCities(value: string): CustomerCitiesListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter((element) =>
      this.getTranslatedCityName(element).toLowerCase().includes(filterValue)
    );
  }

  get f() {
    return this.restaurantForm.controls;
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

  getLocalityesWithCityId(id: string) {
    this.api.get_public('v1/public/localities_from_city/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.localities && response.localities.length > 0) {
          this.listOfLocalities = response.localities;
          this.localities = this.localityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterLocality(element) : this.listOfLocalities.slice()))
          );
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'public');
      }
    });
  }

  private _filterLocality(value: string): CustomerLocalityListInterface[] {
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
      city: '',
      locality: null,
      locationType: 'Point',
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
  }

  onFileChoose(fileEvent: any, fileType: string) {
    console.log(fileEvent);
    if (fileEvent.target.files && fileEvent.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(fileEvent.target.files[0]);
      reader.onload = (buffer: any) => {
        if (fileType == 'cover') {
          this.coverFileURL = buffer.target.result;
          this.coverFileTarget = fileEvent.target.files[0];
        } else if (fileType == 'logo') {
          this.logoFileURL = buffer.target.result;
          this.logoFileTarget = fileEvent.target.files[0];
        }
      }
    }
  }

  onRemoveImageFile(fileType: string) {
    console.log(fileType);
    if (fileType == 'cover') {
      this.coverFileTarget = null;
      this.coverFileURL = 'assets/images/placeholder.png';
    } else if (fileType == 'logo') {
      this.logoFileTarget = null;
      this.logoFileURL = 'assets/images/placeholder.png';
    }
  }

  onUploadImageFile(fileType: string) {
    console.log(fileType);

    if (fileType == 'cover') {
      if (this.coverFileTarget) {
        const mimeType = this.coverFileTarget.type;
        if (mimeType.match(/image\/*/) == null) {
          this.util.onError('ts_please_upload_image_files', '');
          return;
        }
        const spinnerRef = this.util.start('ts_uploading');
        this.api.uploadFilePublic(this.coverFileTarget).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.path) {
              this.restaurantForm.controls['cover'].setValue(response.path);
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    } else if (fileType == 'logo') {
      if (this.logoFileTarget) {
        const mimeType = this.logoFileTarget.type;
        if (mimeType.match(/image\/*/) == null) {
          this.util.onError('ts_please_upload_image_files', '');
          return;
        }
        const spinnerRef = this.util.start('ts_uploading');
        this.api.uploadFilePublic(this.logoFileTarget).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            if (response && response.path) {
              this.restaurantForm.controls['logo'].setValue(response.path);
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    }
  }

  onFileChangeForm(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (buffer: any) => {
        console.log(buffer);
        this.joininFormField[index].fileURL = buffer.target.result;
        this.joininFormField[index].fileTarget = event.target.files[0];
      };
    }
  }

  onRemoveImageFileForm(index: number) {
    this.joininFormField[index].fileURL = 'assets/images/placeholder.png';
    this.joininFormField[index].fileTarget = '';
  }

  onUploadImageFileForm(index: number) {
    console.log(this.joininFormField[index]);
    if (this.joininFormField[index].fileTarget) {
      const mimeType = this.joininFormField[index].fileTarget.type;
      if (mimeType.match(/image\/*/) == null) {
        this.util.onError('ts_please_upload_image_files', '');
        return;
      }
      const spinnerRef = this.util.start('ts_uploading');
      this.api.uploadFilePublic(this.joininFormField[index].fileTarget).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.path) {
            this.joininFormField[index].value = response.path;
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'public');
        }
      });
    }
  }

  onBusinessModelChange(model: string) {
    this.restaurantForm.controls['businessType'].setValue(model);
    if (model == 'commission') {
      this.restaurantForm.controls['subscriptionId'].setValue('');
    } else {
      if (this.subscriptionPackages.length > 0) {
        this.restaurantForm.controls['subscriptionId'].setValue(this.subscriptionPackages[0].id);
      }
    }
  }

  onSubscriptionPackageChange(id: string) {
    this.restaurantForm.controls['subscriptionId'].setValue(id);
    const findIndex = this.subscriptionPackages.findIndex((x) => x.id == id);
    if (findIndex != -1) {
      this.payAmount = this.subscriptionPackages[findIndex].discount > 0 ? this.subscriptionPackages[findIndex].discountPrice : this.subscriptionPackages[findIndex].price;
      if (this.subscriptionPackages[findIndex].haveTrial) {
        this.haveTrial = true;
        this.trialPeriod = this.subscriptionPackages[findIndex].trialValidity;
        this.paymentId = 'trial';
      } else {
        this.haveTrial = false;
        this.trialPeriod = 0;
      }
      if (this.haveTrial == false && this.paymentList.length > 0) {
        this.paymentId = this.paymentList[0].id;
      }
    }
  }

  onPaymentMethodChange(id: string) {
    console.log(id);
    this.paymentId = id;
  }

  onBack() {
    if (this.currentIndex == 2) {
      this.currentIndex = 1;
    } else if (this.currentIndex == 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = 0;
    }
  }

  onSubmit() {
    console.log('on save');
    if (this.currentIndex == 0) {
      console.log(this.restaurantForm);
      console.log(this.joininFormField);
      console.log(this.restaurantForm.getRawValue());
      this.haveSubmitClicked = true;
      const indexOfRequiredField = this.joininFormField.findIndex((element) => element.isRequired == true && element.value == '' && element.type != 'choose');
      console.log(indexOfRequiredField);
      if (this.restaurantForm.valid && indexOfRequiredField == -1) {
        console.log('Submit');
        const param = {
          'email': this.restaurantForm.controls['email'].value,
          'countryCode': this.restaurantForm.controls['countryCode'].value,
          'mobile': this.restaurantForm.controls['mobile'].value,
        };
        console.log(param);
        const spinnerRef = this.util.start('ts_saving');
        this.api.post_private('v1/auth/check-register-status/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            let element = document.getElementById('topContent');
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.currentIndex = 1;
          }, error: (error: any) => {
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'public');
          }
        });
      }
    } else if (this.currentIndex == 1 && this.restaurantForm.controls['businessType'].value == 'commission') {
      this.onFinalPage();
    } else if (this.currentIndex == 1 && this.restaurantForm.controls['businessType'].value == 'subscription') {
      if (this.restaurantForm.controls['subscriptionId'].value != '') {
        let element = document.getElementById('topContent');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.currentIndex = 2;
      } else {
        this.util.onError('Please select subscription package', '');
      }
    } else if (this.currentIndex == 2) {
      if (this.paymentId != '') {
        this.onFinalPage();
      } else {
        this.util.onError('Please select payment method', '');
      }
    }
  }

  onFinalPage() {
    console.log('Final Page');
    console.log(this.restaurantForm);
    console.log(this.joininFormField);
    console.log(this.restaurantForm.getRawValue());
    const locale = this.restaurantForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], address: [element.address], shortDescription: [element.shortDescription] }));
    });

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

    const mappedItems = this.joininFormField.map((item) => {
      if (item.type == 'choose') {
        item.value = item.title;
      }
      const obj: any = {
        'fieldName': item.title,
        'fieldType': item.type,
        'fieldValue': item.type == 'phone' ? `+${item.extraValue} ${item.value}` : item.value,
        'fieldItems': item.items,
      }
      return obj;
    });
    const formInputFields: any[] = mappedItems;
    const redirectUrl = `${window.location.origin}/register-request-saved/`;
    const param: any = {
      'email': sendData.email,
      'password': sendData.password,
      'firstName': sendData.firstName,
      'lastName': sendData.lastName,
      'countryCode': sendData.countryCode,
      'mobile': sendData.mobile,
      'name': sendData.name,
      'address': sendData.address,
      'shortDescription': sendData.shortDescription,
      'cuisine': sendData.cuisine,
      'logo': sendData.logo,
      'cover': sendData.cover,
      'city': sendData.city,
      'locality': sendData.locality,
      'latitude': sendData.latitude,
      'longitude': sendData.longitude,
      'locationType': 'Point',
      'approxDeliveryTime': sendData.approxDeliveryTime,
      'dishPriceForTwo': sendData.dishPriceForTwo,
      'takeAway': sendData.takeAway,
      'restaurantType': sendData.restaurantType,
      'restaurantFacility': sendData.restaurantFacility,
      'acceptScheduleDelivery': sendData.acceptScheduleDelivery,
      'acceptHomeDelivery': sendData.acceptHomeDelivery,
      'minOrderAmount': sendData.minOrderAmount,
      'license': sendData.license,
      'licenseId': sendData.licenseId,
      'businessType': sendData.businessType,
      'subscriptionId': sendData.subscriptionId,
      'translations': sendData.translations,
      'paymentId': this.paymentId,
      'formElement': formInputFields,
      'locale': this.util.appLocaleName(),
      'socialFacebook': sendData.socialFacebook,
      'socialInstagram': sendData.socialInstagram,
      'socialX': sendData.socialX,
      'socialYoutube': sendData.socialYoutube,
      'socialLinkedIn': sendData.socialLinkedIn,
      'socialPinterest': sendData.socialPinterest,
      'redirect': redirectUrl,
    }
    console.log(param);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/public/restaurant_joining/request/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        console.log(`Status --> ${response.status}`);
        console.log(`Pay Link --> ${response.payLink}`);
        if (response && response.status && response.status == 'offline') {
          this.util.onSuccess('ts_request_sent');
          this.router.navigateByUrl('/register-request-saved', { replaceUrl: true });
        } else {
          const webURL = `${this.api.baseUrl}v1/public/payments/makePayment/${response.payLink}`;
          window.location.href = webURL;
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'public');
      }
    });
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
    const dialogRef = this.dialog.open(DialogRestaurantSelfRegisterDeliveryTimePicker, {
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

  onLicenseSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['license'].setValue(event.option.value);
    }
  }

  getTranslatedCityName(item: CustomerCitiesListInterface): string {
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

  getTranslatedLocalityName(item: CustomerLocalityListInterface): string {
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

  private _filterCuisine(value: string): CustomerCuisineListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCuisine.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantType(value: string): CustomerRestaurantTypeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfType.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterRestaurantFacilities(value: string): CustomerRestaurantFacilitiesInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfFacilities.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterLicense(value: string): RestaurantFoodLicenseListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLicenses.filter((element) =>
      this.getTranslatedLicenseName(element).toLowerCase().includes(filterValue)
    );
  }

  getTranslatedLicenseName(item: RestaurantFoodLicenseListInterface): string {
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

}
