import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { VendorCuisineListForOutletInterface } from 'src/app/interfaces/vendor.cuisine.list.for.outlet.interface';
import { VendorFacilitiesListForRestaurantInterface } from 'src/app/interfaces/vendor.facilities.list.for.outlet.interface';
import { VendorLicenseListForOutletInterface } from 'src/app/interfaces/vendor.license.list.for.outlet.interface';
import { VendorRestaurantTypeListForNewOutletInterface } from 'src/app/interfaces/vendor.restaurant.type.list.for.new.outlet.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, startWith, map } from 'rxjs';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeliveryTimePicker } from 'src/app/pages/admin/restaurant-management/restaurants/manage-restaurant/dialog-delivery-time-picker/dialog-delivery-time-picker';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-edit-vendor-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './edit-vendor-details.html',
})
export class EditVendorDetails {

  restaurantForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    restaurantType: new FormControl('', [Validators.required]),
    approxDeliveryTime: new FormControl('10 to 20 min', Validators.required),
    dishPriceForTwo: new FormControl('', [Validators.required]),
    restaurantFacility: new FormControl('', [Validators.required]),
    minOrderAmount: new FormControl('', [Validators.required]),
    temporaryClosed: new FormControl(false),
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
  licenses: Observable<VendorLicenseListForOutletInterface[]>;
  listOfLicenses: VendorLicenseListForOutletInterface[] = [];
  licenseCtrl = new FormControl('');

  constructor(
    public api: ApiService,
    public util: UtilService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    this.getInfo();
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/restaurant/getDetailForWebUpdate/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);

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

        if (response && response.info) {
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
          this.restaurantForm.controls['takeAway'].setValue(values.takeAway);

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
        }
        console.log(this.restaurantForm);
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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

  private _filterLicense(value: string): VendorLicenseListForOutletInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfLicenses.filter((element) =>
      this.getTranslatedLicenseName(element).toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    console.log('submit');
    this.haveSubmitClicked = true;
    const locale = this.restaurantForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], address: [element.address], shortDescription: [element.shortDescription] }));
    });
    console.log(this.restaurantForm.getRawValue());
    if (this.restaurantForm.valid) {
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

      console.log(sendData);

      console.log('on submit');
      console.log(sendData);
      const param = {
        logo: sendData.logo,
        cover: sendData.cover,
        name: sendData.name,
        address: sendData.address,
        shortDescription: sendData.shortDescription,
        cuisine: sendData.cuisine,
        type: sendData.restaurantType,
        facility: sendData.restaurantFacility,
        homeDelivery: sendData.acceptHomeDelivery,
        takeaway: sendData.takeAway,
        scheduleOrder: sendData.acceptScheduleDelivery,
        license: sendData.license,
        licenseId: sendData.licenseId,
        minOrderAmount: sendData.minOrderAmount,
        dishPriceForTwo: sendData.dishPriceForTwo,
        deliveryTime: sendData.approxDeliveryTime,
        socialFacebook: sendData.socialFacebook,
        socialInstagram: sendData.socialInstagram,
        socialX: sendData.socialX,
        socialYoutube: sendData.socialYoutube,
        socialLinkedIn: sendData.socialLinkedIn,
        socialPinterest: sendData.socialPinterest,
        translations: sendData.translations,
      };
      console.log('update ---->>', param);
      const spinnerRef = this.util.start('ts_updating');
      this.api.patch_private('v1/vendor_web/restaurant/updateDetail/' + this.util.getItem('_vendorId'), param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_updated');
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
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

  onLicenseSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.restaurantForm.controls['license'].setValue(event.option.value);
    }
  }

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

}
