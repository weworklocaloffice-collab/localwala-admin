import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { TimezonListInterface } from 'src/app/interfaces/timezone.list.interface';
import { Observable, map, startWith } from 'rxjs';
import { CurrencyListInterface } from 'src/app/interfaces/currency.list.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { MatSelectChange } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-business-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, GoogleMapsModule, NgIcon],
  templateUrl: './business-settings.html',
  styles: [`
    .address-suggestions-card {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
    }
    .suggestion-item {
      cursor: pointer;
      border-bottom: 1px solid #e5e5e5;
    }
    .suggestion-item:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class BusinessSettings {
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    companyName: new FormControl('', [Validators.required]),
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    mobile: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    latitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    longitude: new FormControl({ value: 0, disabled: true },
      Validators.required),
    timezone: new FormControl('', [Validators.required]),
    timeFormat: new FormControl('12', [Validators.required]),
    defaultCountryCode: new FormControl('', [Validators.required]),
    currency: new FormControl('', [Validators.required]),
    currencySide: new FormControl('left', [Validators.required]),
    decimalPoint: new FormControl('', [Validators.required]),
    cookiesText: new FormControl('', [Validators.required]),
    commission: new FormControl('', [Validators.required]),
    commissionDelivery: new FormControl('', [Validators.required]),
    haveFreeDeliveryInTotal: new FormControl(true),
    freeDelivery: new FormControl('', [Validators.required]),
    haveFreeDeliveryInDistance: new FormControl(true),
    freeDeliveryInDistance: new FormControl('', [Validators.required]),
    deliveryChargeMethod: new FormControl('distance', [Validators.required]),
    deliveryChargeAmount: new FormControl('', [Validators.required]),
    vegNonVegOption: new FormControl(true),
    commissionBasedSystem: new FormControl(true),
    subscriptionBasedSystem: new FormControl(true),
    includeTaxOnFood: new FormControl(false),
    foodTaxName: new FormControl({ value: '', disabled: true },
      Validators.required),
    foodTaxAmount: new FormControl({ value: 0, disabled: true },
      Validators.required),
    foodTaxType: new FormControl({ value: 'per', disabled: true },
      Validators.required),
    receiveNotificationAdmin: new FormControl(false),
    additionalServiceCharge: new FormControl(true),
    additionalServiceName: new FormControl('', [Validators.required]),
    additionalServiceAmount: new FormControl('', [Validators.required]),
    partialPayment: new FormControl(false),
    partialAmountPayment: new FormControl('cod'),
    guestCheckout: new FormControl(false),
    logo: new FormControl('', [Validators.required]),
    favicon: new FormControl('', [Validators.required]),
    maintenance: new FormControl(false),
    refundRequest: new FormControl(false),
    websiteUrl: new FormControl('', [Validators.required]),
    findMode: new FormControl('km', [Validators.required]),
    deliveryArea: new FormControl('', [Validators.required]),
    socialLinks: new FormGroup({
      facebook: new FormControl(''),
      instagram: new FormControl(''),
      x: new FormControl(''),
      youtube: new FormControl(''),
      linked: new FormControl(''),
      pinterest: new FormControl(''),
      playstore: new FormControl(''),
      appstore: new FormControl(''),
      vimeo: new FormControl(''),
    }),
    otpType: new FormControl('num', [Validators.required]),
    canResendOtp: new FormControl(true, [Validators.required]),
    otpLength: new FormControl(6, [Validators.required]),
    foodLicenseImage: new FormControl(''),
    foodLicenseName: new FormControl(''),
    foodLicenseWebsite: new FormControl(''),
    foodLicense: new FormControl(''),
    complianceForm: new FormArray([]),
  });
  haveSubmitClicked: boolean = false;
  timezones: Observable<TimezonListInterface[]>;
  listOfTimezone: TimezonListInterface[] = [];
  timezoneCtrl = new FormControl();
  currencys: Observable<CurrencyListInterface[]>;
  listOfCurrencys: CurrencyListInterface[] = [];
  currencysCtrl = new FormControl();
  countryCodes: Observable<CountryCodeInterface[]>;
  countryDialCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  countryDialCodeCtrl = new FormControl();
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

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.getCountryCodes();
    this.getTimezones();
    this.getCurrencyCode();
    this.getData();
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

        this.countryDialCodes = this.countryDialCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryDialCode(element) : this.listOfCountryCodes.slice()))
        );
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  getCurrencyCode() {
    this.api.getLocalAssets('currencyCode.json').then((response: any) => {
      if (response) {
        this.listOfCurrencys = response;
        this.currencys = this.currencysCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCurrencyCode(element) : this.listOfCurrencys.slice()))
        );
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  getTimezones() {
    this.api.getLocalAssets('timezones.json').then((response: any) => {
      if (response) {
        this.listOfTimezone = response;
        this.timezones = this.timezoneCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterTimezoneCode(element) : this.listOfTimezone.slice()))
        );
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterCurrencyCode(value: any): CurrencyListInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.cc) {
      filterValue = value.cc;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCurrencys.filter((element) =>
      element.cc.toLowerCase().includes(filterValue)
    );
  }

  private _filterTimezoneCode(value: any): TimezonListInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.text) {
      filterValue = value.text;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfTimezone.filter((element) =>
      element.text.toLowerCase().includes(filterValue)
    );
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterCountryDialCode(value: any): CountryCodeInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  getData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/business_settings/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id && response.companyName) {
          this.id = response.id;
          this.action = 'edit';
          this.settingForm.controls['companyName'].setValue(response.companyName);
          this.settingForm.controls['email'].setValue(response.email);
          this.settingForm.controls['mobile'].setValue(response.mobile);
          this.settingForm.controls['country'].setValue(response.country);
          this.settingForm.controls['address'].setValue(response.address);
          this.settingForm.controls['logo'].setValue(response.logo);
          this.settingForm.controls['favicon'].setValue(response.favicon);
          this.settingForm.controls['cookiesText'].setValue(response.cookiesText);
          this.settingForm.controls['commission'].setValue(response.commission);
          this.settingForm.controls['commissionDelivery'].setValue(response.commissionDelivery);
          this.settingForm.controls['additionalServiceAmount'].setValue(response.additionalServiceAmount);
          this.settingForm.controls['additionalServiceCharge'].setValue(response.additionalServiceCharge);
          this.settingForm.controls['additionalServiceName'].setValue(response.additionalServiceName);

          this.settingForm.controls['haveFreeDeliveryInDistance'].setValue(response.haveFreeDeliveryInDistance);
          this.settingForm.controls['haveFreeDeliveryInTotal'].setValue(response.haveFreeDeliveryInTotal);
          this.settingForm.controls['freeDelivery'].setValue(response.freeDelivery);
          this.settingForm.controls['freeDeliveryInDistance'].setValue(response.freeDeliveryInDistance);

          this.settingForm.controls['vegNonVegOption'].setValue(response.vegNonVegOption);
          this.settingForm.controls['commissionBasedSystem'].setValue(response.commissionBasedSystem);
          this.settingForm.controls['subscriptionBasedSystem'].setValue(response.subscriptionBasedSystem);
          this.settingForm.controls['includeTaxOnFood'].setValue(response.includeTaxOnFood);
          this.settingForm.controls['receiveNotificationAdmin'].setValue(response.receiveNotificationAdmin);
          this.settingForm.controls['guestCheckout'].setValue(response.guestCheckout);

          this.settingForm.controls['currencySide'].setValue(response.currencySide);
          this.settingForm.controls['decimalPoint'].setValue(response.decimalPoint);

          this.settingForm.controls['defaultCountryCode'].setValue(response.defaultCountryCode);

          this.settingForm.controls['timezone'].setValue(response.timezone);
          this.settingForm.controls['currency'].setValue(response.currency);

          this.settingForm.controls['maintenance'].setValue(response.maintenance);
          this.settingForm.controls['findMode'].setValue(response.findMode);
          this.settingForm.controls['deliveryArea'].setValue(response.deliveryArea);

          this.settingForm.controls['refundRequest'].setValue(response.refundRequest);

          this.settingForm.controls['otpType'].setValue(response.otpType);
          this.settingForm.controls['canResendOtp'].setValue(response.canResendOtp);
          this.settingForm.controls['otpLength'].setValue(response.otpLength);

          this.settingForm.controls['foodLicenseImage'].setValue(response.foodLicenseImage);
          this.settingForm.controls['foodLicenseName'].setValue(response.foodLicenseName);
          this.settingForm.controls['foodLicenseWebsite'].setValue(response.foodLicenseWebsite);
          this.settingForm.controls['foodLicense'].setValue(response.foodLicense);

          if (response && response.complianceForm && response.complianceForm instanceof Array) {
            const formElement = response.complianceForm;
            const formElementArray = this.settingForm.get('complianceForm') as FormArray;
            formElement.forEach((element: any) => {
              formElementArray.push(this.fb.group({
                fieldName: new FormControl(`${element.fieldName}`),
                fieldValue: new FormControl(`${element.fieldValue}`),
              }));
            });
          }

          this.settingForm.controls['foodTaxName'].setValue(response.foodTaxName);
          this.settingForm.controls['foodTaxAmount'].setValue(response.foodTaxAmount);
          this.settingForm.controls['foodTaxType'].setValue(response.foodTaxType);

          this.settingForm.controls['deliveryChargeMethod'].setValue(response.deliveryChargeMethod);
          this.settingForm.controls['deliveryChargeAmount'].setValue(response.deliveryChargeAmount);

          this.timezoneCtrl.patchValue(response.timezone);
          this.currencysCtrl.patchValue(response.currency);
          this.countryDialCodeCtrl.patchValue(response.defaultCountryCode);

          if (response.additionalServiceCharge == false) {
            this.settingForm.controls['additionalServiceName'].clearValidators();
            this.settingForm.controls['additionalServiceAmount'].clearValidators();
            this.settingForm.controls['additionalServiceName'].disable();
            this.settingForm.controls['additionalServiceAmount'].disable();
          } else {
            this.settingForm.controls['additionalServiceName'].setValidators([Validators.required]);
            this.settingForm.controls['additionalServiceAmount'].setValidators([Validators.required]);
            this.settingForm.controls['additionalServiceName'].enable();
            this.settingForm.controls['additionalServiceAmount'].enable();
          }

          if (response.haveFreeDeliveryInTotal == false) {
            this.settingForm.controls['freeDelivery'].clearValidators();
            this.settingForm.controls['freeDelivery'].disable();
          } else {
            this.settingForm.controls['freeDelivery'].setValidators([Validators.required]);
            this.settingForm.controls['freeDelivery'].enable();
          }

          if (response.haveFreeDeliveryInDistance == false) {
            this.settingForm.controls['freeDeliveryInDistance'].clearValidators();
            this.settingForm.controls['freeDeliveryInDistance'].disable();
          } else {
            this.settingForm.controls['freeDeliveryInDistance'].setValidators([Validators.required]);
            this.settingForm.controls['freeDeliveryInDistance'].enable();
          }

          if (response.includeTaxOnFood == false) {
            this.settingForm.controls['foodTaxName'].clearValidators();
            this.settingForm.controls['foodTaxName'].disable();
            this.settingForm.controls['foodTaxAmount'].clearValidators();
            this.settingForm.controls['foodTaxAmount'].disable();
            this.settingForm.controls['foodTaxType'].clearValidators();
            this.settingForm.controls['foodTaxType'].disable();
          } else {
            this.settingForm.controls['foodTaxName'].setValidators([Validators.required]);
            this.settingForm.controls['foodTaxName'].enable();
            this.settingForm.controls['foodTaxAmount'].setValidators([Validators.required]);
            this.settingForm.controls['foodTaxAmount'].enable();
            this.settingForm.controls['foodTaxType'].setValidators([Validators.required]);
            this.settingForm.controls['foodTaxType'].enable();
          }

          if (response && response.location && response.location.coordinates) {
            this.settingForm.controls['latitude'].setValue(response.location.coordinates[1]);
            this.settingForm.controls['longitude'].setValue(response.location.coordinates[0]);
            this.mapCenterLocation = new google.maps.LatLng(response.location.coordinates[1], response.location.coordinates[0]);
            this.markerPosition = { lat: response.location.coordinates[1], lng: response.location.coordinates[0] };
          }

          if (response && response.socialLinks && response.socialLinks instanceof Object) {
            const links = response.socialLinks;
            this.settingForm.controls['socialLinks'].controls['appstore'].setValue(links.appstore);
            this.settingForm.controls['socialLinks'].controls['facebook'].setValue(links.facebook);
            this.settingForm.controls['socialLinks'].controls['instagram'].setValue(links.instagram);
            this.settingForm.controls['socialLinks'].controls['linked'].setValue(links.linked);
            this.settingForm.controls['socialLinks'].controls['pinterest'].setValue(links.pinterest);
            this.settingForm.controls['socialLinks'].controls['playstore'].setValue(links.playstore);
            this.settingForm.controls['socialLinks'].controls['vimeo'].setValue(links.vimeo);
            this.settingForm.controls['socialLinks'].controls['x'].setValue(links.x);
            this.settingForm.controls['socialLinks'].controls['youtube'].setValue(links.youtube);
          }

          if (response && response.websiteUrl && response.websiteUrl != '' && response.websiteUrl != null) {
            this.settingForm.controls['websiteUrl'].setValue(response.websiteUrl);
          } else {
            this.settingForm.controls['websiteUrl'].setValue(window.location.origin + '/');
          }
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
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    console.log('cc', this.currencysCtrl);
    console.log('timezon', this.timezoneCtrl);
    this.haveSubmitClicked = true;
    if (this.settingForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/business_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_business_info_saved');
        window.location.reload();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/business_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_business_info_updated');
        window.location.reload();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onImageClick(formName: string) {
    console.log('on image click for ', formName);
    const dialogRef = this.dialog.open(SelectMediaDialog, {
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
          this.settingForm.controls['logo'].setValue(result.data);
        } else if (formName == 'favicon') {
          this.settingForm.controls['favicon'].setValue(result.data);
        } else if (formName == 'license') {
          this.settingForm.controls['foodLicenseImage'].setValue(result.data);
        }
      }
    });
  }

  onReset() {
    console.log('reset');
    this.haveSubmitClicked = false;
    this.settingForm.reset();
    this.complianceForm.clear();
    this.settingForm.patchValue({
      timeFormat: '12',
      currencySide: 'left',
      deliveryChargeMethod: 'distance',
      findMode: 'km',
      otpType: 'num',
      canResendOtp: true,
      otpLength: 6,
      vegNonVegOption: true,
      commissionBasedSystem: true,
      subscriptionBasedSystem: true,
      haveFreeDeliveryInTotal: true,
      haveFreeDeliveryInDistance: true,
      additionalServiceCharge: true,
      latitude: 0,
      longitude: 0,
      foodTaxType: 'per'
    });
    const socialLinks = this.settingForm.get('socialLinks') as FormGroup;
    socialLinks.patchValue({
      facebook: '',
      instagram: '',
      x: '',
      youtube: '',
      linked: '',
      pinterest: '',
      playstore: '',
      appstore: '',
      vimeo: ''
    });
    this.settingForm.enable();
  }

  get f() {
    return this.settingForm.controls;
  }

  get complianceForm(): FormArray {
    return this.settingForm.get('complianceForm') as FormArray;
  }

  onTimezoneSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.settingForm.controls['timezone'].setValue(event.option.value);
    }
  }

  onCurrencySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.settingForm.controls['currency'].setValue(event.option.value);
    }
  }

  displayCurrencyName(currency: CurrencyListInterface) {
    return currency && currency.name && currency.cc && currency.symbol ? `${currency.cc} - ( ${currency.symbol}) ` : '';
  }

  displayCountryDialCode(code: CountryCodeInterface) {
    return code && code.name && code.dial_code && code.flag ? `${code.flag} ( ${code.dial_code} ) ${code.name}` : '';
  }

  displayTimezoneName(timezone: TimezonListInterface) {
    return timezone && timezone.text && timezone.value ? timezone.text : '';
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.settingForm.controls['country'].setValue(event.option.value);
    }
  }

  onCountryDialCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.settingForm.controls['defaultCountryCode'].setValue(event.option.value);
    }
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setBusinessLocation();
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setBusinessLocation();
    }
  }

  setBusinessLocation() {
    this.settingForm.controls['latitude'].setValue(this.markerPosition.lat);
    this.settingForm.controls['longitude'].setValue(this.markerPosition.lng);
  }

  onAdditionalServiceChargeChanged(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.settingForm.controls['additionalServiceName'].clearValidators();
      this.settingForm.controls['additionalServiceAmount'].clearValidators();
      this.settingForm.controls['additionalServiceName'].disable();
      this.settingForm.controls['additionalServiceAmount'].disable();
    } else {
      this.settingForm.controls['additionalServiceName'].setValidators([Validators.required]);
      this.settingForm.controls['additionalServiceAmount'].setValidators([Validators.required]);
      this.settingForm.controls['additionalServiceName'].enable();
      this.settingForm.controls['additionalServiceAmount'].enable();
    }
  }

  onFreeDeliveryOnPriceChanged(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.settingForm.controls['freeDelivery'].clearValidators();
      this.settingForm.controls['freeDelivery'].disable();
    } else {
      this.settingForm.controls['freeDelivery'].setValidators([Validators.required]);
      this.settingForm.controls['freeDelivery'].enable();
    }
  }

  onFreeDeliveryOnDistanceChanged(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.settingForm.controls['freeDeliveryInDistance'].clearValidators();
      this.settingForm.controls['freeDeliveryInDistance'].disable();
    } else {
      this.settingForm.controls['freeDeliveryInDistance'].setValidators([Validators.required]);
      this.settingForm.controls['freeDeliveryInDistance'].enable();
    }
  }

  onFoodTaxChanged(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.settingForm.controls['foodTaxName'].clearValidators();
      this.settingForm.controls['foodTaxName'].disable();
      this.settingForm.controls['foodTaxAmount'].clearValidators();
      this.settingForm.controls['foodTaxAmount'].disable();
      this.settingForm.controls['foodTaxType'].clearValidators();
      this.settingForm.controls['foodTaxType'].disable();
    } else {
      this.settingForm.controls['foodTaxName'].setValidators([Validators.required]);
      this.settingForm.controls['foodTaxName'].enable();
      this.settingForm.controls['foodTaxAmount'].setValidators([Validators.required]);
      this.settingForm.controls['foodTaxAmount'].enable();
      this.settingForm.controls['foodTaxType'].setValidators([Validators.required]);
      this.settingForm.controls['foodTaxType'].enable();
    }
  }

addComplianceField() {
    const formElementArray = this.settingForm.get('complianceForm') as FormArray;
    formElementArray.push(this.fb.group({ fieldName: new FormControl(''), fieldValue: new FormControl('') }));
  }

  removeComplianceField(index: number) {
    const formElementArray = this.settingForm.get('complianceForm') as FormArray;
    formElementArray.removeAt(index);
  }

  addressSuggestions: google.maps.places.AutocompletePrediction[] = [];

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.markerPosition = { lat, lng };
          this.mapCenterLocation = new google.maps.LatLng(lat, lng);
          this.setBusinessLocation();
          this.reverseGeocodeLatLng(lat, lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.util.onError('Unable to get current location', '');
        }
      );
    } else {
      this.util.onError('Geolocation is not supported by this browser', '');
    }
  }

  private reverseGeocodeLatLng(lat: number, lng: number) {
    if (!google.maps.Geocoder) return;
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }).then((response) => {
      if (response.results && response.results.length > 0) {
        const address = response.results[0].formatted_address;
        this.settingForm.controls['address'].setValue(address);
      }
    }).catch((error) => {
      console.error('Geocoder error:', error);
      this.util.onError('Unable to get address from location', '');
    });
  }

  onAddressInput(event: any) {
    const input = event.target.value;
    if (input.length > 2 && google.maps.places && google.maps.places.AutocompleteService) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input })
        .then((response) => {
          this.addressSuggestions = response?.predictions || [];
        })
        .catch((error) => {
          console.error('Autocomplete error:', error);
          this.addressSuggestions = [];
        });
    } else {
      this.addressSuggestions = [];
    }
  }

  onAddressSelect(prediction: google.maps.places.AutocompletePrediction) {
    this.settingForm.controls['address'].setValue(prediction.description);
    this.addressSuggestions = [];
    if (google.maps.places && google.maps.places.PlacesService) {
      const dummyDiv = document.createElement('div');
      const placeService = new google.maps.places.PlacesService(dummyDiv);
      placeService.getDetails({ placeId: prediction.place_id }, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          this.markerPosition = { lat, lng };
          this.mapCenterLocation = new google.maps.LatLng(lat, lng);
          this.setBusinessLocation();
        }
      });
    }
  }
}
