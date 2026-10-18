import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-admin-pos-customer-address-dialog',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule],
  templateUrl: './admin-pos-customer-address-dialog.html',
})
export class AdminPosCustomerAddressDialog {
  addressForm = new FormGroup({
    receiverName: new FormControl('', [Validators.required]),
    flatHouse: new FormControl('', [Validators.required]),
    locality: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    receiverContact: new FormControl('', [Validators.required]),
    landmark: new FormControl(''),
    longitude: new FormControl(0, [Validators.required]),
    latitude: new FormControl(0, [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  mapCenterLocation: google.maps.LatLng;
  mapTypeId: google.maps.MapTypeId.ROADMAP;
  mapOptions: google.maps.MapOptions = {
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeId: 'roadmap'
  };
  markerPosition: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  restaurantLat: number = 0;
  restaurantLng: number = 0;
  deliveryArea: number = 5;
  findMode: string = 'km';

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<AdminPosCustomerAddressDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getCountryCodes();
    this.addressForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    console.log(this.data);
    this.deliveryArea = this.data && this.data.deliveryArea && this.data.deliveryArea != 0 ? this.data.deliveryArea : 5;
    this.findMode = this.data && this.data.findMode && this.data.findMode != '' ? this.data.findMode : 'km';
    this.restaurantLat = this.data && this.data.restaurantLat && this.data.restaurantLat != 0 ? this.data.restaurantLat : 0;
    this.restaurantLng = this.data && this.data.restaurantLng && this.data.restaurantLng != 0 ? this.data.restaurantLng : 0;

    if (this.data && this.data.address && this.data.address.flatHouse != '') {
      const address = this.data.address;
      console.log(address);
      this.addressForm.controls['receiverName'].setValue(address.receiverName);
      this.addressForm.controls['flatHouse'].setValue(address.flatHouse);
      this.addressForm.controls['locality'].setValue(address.locality);
      this.addressForm.controls['receiverContact'].setValue(address.receiverContact);
      this.addressForm.controls['landmark'].setValue(address.landmark);
      this.addressForm.controls['latitude'].setValue(address.latitude);
      this.addressForm.controls['longitude'].setValue(address.longitude);

      this.addressForm.controls['countryCode'].setValue(address.countryCode);
      this.mapCenterLocation = new google.maps.LatLng(address.latitude, address.longitude);
      this.markerPosition = { lat: address.latitude, lng: address.longitude };
    } else {
      this.addressForm.controls['latitude'].setValue(this.data.cityLat);
      this.addressForm.controls['longitude'].setValue(this.data.cityLng);
      this.mapCenterLocation = new google.maps.LatLng(this.data.cityLat, this.data.cityLng);
      this.markerPosition = { lat: this.data.cityLat, lng: this.data.cityLng };
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
        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
        if (this.addressForm.controls['countryCode'].valid && this.addressForm.controls['countryCode'].value != '') {
          const selectedCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.addressForm.controls['countryCode'].value);
          this.countryCodeCtrl.setValue(selectedCountryCode[0].flag + ' ' + selectedCountryCode[0].dial_code + ' ' + selectedCountryCode[0].name);
        }
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

  get f() {
    return this.addressForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.addressForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setDeliveryLocation();
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.setDeliveryLocation();
    }
  }

  setDeliveryLocation() {
    this.addressForm.controls['latitude'].setValue(this.markerPosition.lat);
    this.addressForm.controls['longitude'].setValue(this.markerPosition.lng);
  }

  onSubmit() {
    console.log('submit');
    console.log(this.addressForm.getRawValue());
    this.isFormSubmit = true;
    if (this.addressForm.valid) {
      const lat1 = Number(this.restaurantLat.toString());
      const lng1 = Number(this.restaurantLng.toString());
      const lat2 = Number(this.addressForm.controls['latitude'].value?.toString() || 0);
      const lng2 = Number(this.addressForm.controls['longitude'].value?.toString() || 0);
      const distance = this.util.getDistance(lat1, lng1, lat2, lng2, this.findMode == 'km' ? 'K' : 'M');
      const deliveryDistance = parseFloat(distance.toString()).toFixed(2);
      if (parseFloat(deliveryDistance) <= parseFloat(this.deliveryArea.toString())) {
        console.log('OK');
        this.dialogRef.close({ event: 'saved', data: this.addressForm.getRawValue() });
      } else {
        this.util.onError('ts_deliver_area_error', `${this.deliveryArea}${this.findMode == 'km' ? this.util.appTranslate('kilometers') : this.util.appTranslate('miles')}`);
      }
    }
  }
}
