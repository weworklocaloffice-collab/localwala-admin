import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import { AdminRestaurantListLimitedInfoInterface } from 'src/app/interfaces/admin.restaurant.list.limited.info.interface';
import { UserSearchListInterface } from 'src/app/interfaces/user.search.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogDiningCouponUsers } from './dialog-dining-coupon-users/dialog-dining-coupon-users';
import { DateTime } from 'luxon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-manage-dining-coupon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-manage-dining-coupon.html',
})
export class DialogManageDiningCoupon {

  action: string = 'add';
  couponForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    latitude: new FormControl(0, [Validators.required]),
    longitude: new FormControl(0, [Validators.required]),
    type: new FormControl('Point', [Validators.required]),
    allRestaurants: new FormControl(true),
    restaurant: new FormControl<string[]>({ value: [], disabled: true }),
    allUsers: new FormControl(true),
    user: new FormControl({ value: '', disabled: true }),
    code: new FormControl('', [Validators.required]),
    limitSameUser: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    expires: new FormControl('', [Validators.required]),
    discountType: new FormControl('amount', [Validators.required]),
    minDiscount: new FormControl('', [Validators.required]),
    maxDiscount: new FormControl({ value: '', disabled: true }),
    availability: new FormControl('breakfast', [Validators.required]),
    preBookingChargeRequired: new FormControl(false),
    preBookingChargeAmount: new FormControl({ value: '', disabled: true }),
    createdById: new FormControl('', [Validators.required]),
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
  savedUsers: UserSearchListInterface[] = [];
  userCtrl = new FormControl({ value: '', disabled: true });
  restaurants: Observable<AdminRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: AdminRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');
  restauantIds: string[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private navCtrl: Location,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    const userId = this.util.getItem('_uid');
    console.log(`User Id --> ${userId}`);
    if (userId && userId !== null && userId !== '') {
      this.couponForm.controls['createdById'].setValue(userId);
    }
    if (this.id && this.action == 'edit') {
      console.log('on edit');
      this.getInfo();
    } else {
      this.getInitial();
      this.locale();
    }
  }


  getInfo() {
    console.log('get info===>');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/dining_coupon/getInfo/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.info && response.info.id && response.info.id == this.id) {
          const info = response.info;
          this.couponForm.controls['allRestaurants'].patchValue(info.allRestaurants);
          this.couponForm.controls['allUsers'].patchValue(info.allUsers);
          this.couponForm.controls['code'].patchValue(info.code);
          this.couponForm.controls['discountType'].patchValue(info.discountType);
          this.couponForm.controls['limitSameUser'].patchValue(info.limitSameUser);
          this.couponForm.controls['maxDiscount'].patchValue(info.maxDiscount);
          this.couponForm.controls['minDiscount'].patchValue(info.minDiscount);
          this.couponForm.controls['name'].patchValue(info.name);

          if (info && info.discountType == 'percentage') {
            this.couponForm.controls['maxDiscount'].enable();
            this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
          } else {
            this.couponForm.controls['maxDiscount'].disable();
            this.couponForm.controls['maxDiscount'].clearValidators();
          }

          this.couponForm.controls['availability'].setValue(info.availability);
          this.couponForm.controls['preBookingChargeRequired'].setValue(info.preBookingChargeRequired);
          this.couponForm.controls['preBookingChargeAmount'].setValue(info.preBookingChargeAmount);
          if (info.preBookingChargeRequired == true) {
            this.couponForm.controls['preBookingChargeAmount'].enable();
            this.couponForm.controls['preBookingChargeAmount'].setValidators([Validators.required]);
          } else {
            this.couponForm.controls['preBookingChargeAmount'].disable();
            this.couponForm.controls['preBookingChargeAmount'].clearValidators();
          }

          if (info && info.allRestaurants == false) {
            this.restaurantCtrl.enable();
            this.restaurantCtrl.setValidators([Validators.required]);
            this.couponForm.controls['restaurant'].enable();
            this.couponForm.controls['restaurant'].setValidators([Validators.required]);
          } else {
            this.restauantIds = [];
            this.couponForm.controls['restaurant'].patchValue([]);
            this.restaurantCtrl.disable();
            this.restaurantCtrl.clearValidators();
            this.couponForm.controls['restaurant'].disable();
            this.couponForm.controls['restaurant'].clearValidators();
          }

          if (info && info.allUsers == false) {
            this.userCtrl.enable();
            this.userCtrl.setValidators([Validators.required]);
            this.couponForm.controls['user'].enable();
            this.couponForm.controls['user'].setValidators([Validators.required]);
          } else {
            this.savedUsers = [];
            this.userCtrl.setValue('');
            this.couponForm.controls['user'].patchValue('');
            this.userCtrl.disable();
            this.userCtrl.clearValidators();
            this.couponForm.controls['user'].disable();
            this.couponForm.controls['user'].clearValidators();
          }

          if (info && info.users && info.users.length) {
            this.savedUsers = info.users;
            console.log('---------------', this.savedUsers);
            const ids = this.savedUsers.map(element => element.id);
            console.log('ids ---> ', ids);
            this.couponForm.controls['user'].patchValue(ids.join(','));
            let other = '';
            if (this.savedUsers.length >= 2) {
              other = `(+ ${(this.savedUsers.length - 1)} other)`;
            }
            this.userCtrl.setValue(this.savedUsers[0].firstName + ' ' + this.savedUsers[0].lastName + ' ' + other)
          }

          if (info && info.location && info.location.coordinates && info.location.coordinates.length) {
            this.couponForm.controls['latitude'].patchValue(info.location.coordinates[1]);
            this.couponForm.controls['longitude'].patchValue(info.location.coordinates[0]);
          }

          const startDate = DateTime.fromISO(info.start).toFormat('yyyy-MM-dd');
          const endDate = DateTime.fromISO(info.expires).toFormat('yyyy-MM-dd');
          console.log(startDate, endDate);
          this.couponForm.controls['start'].setValue(startDate);
          this.couponForm.controls['expires'].setValue(endDate);

          if (info && info.translations && info.translations instanceof Array) {
            this.translations = info.translations;
            this.locale();
          }
        }

        if (response && response.cities && response.cities.length) {
          this.listOfCities = response.cities;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );

          if (response && response.info && response.info.id == this.id) {
            const values = response.info;
            this.couponForm.controls['city'].setValue(values.city);
          }
        }

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
          const values = response.info;
          if (values && values.restaurant && values.restaurant instanceof Array) {
            console.log('have restaurant array');
            this.restauantIds = values.restaurant;
            const savedRestaurant: string[] = values.restaurant;
            const tempRestaurant: any = [];
            this.listOfRestaurants.forEach((element) => {
              if (savedRestaurant.includes(element.id)) {
                tempRestaurant.push(element.displayName);
              }
            });
            this.couponForm.controls['restaurant'].patchValue(tempRestaurant);
          }
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  getInitial() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterArrayItems(element) : this.listOfCities.slice()))
          );
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

  private _filterArrayItems(value: any): AdminCitiesListLimitedInterface[] {
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

  get f() {
    return this.couponForm.controls;
  }

  onReset() {
    console.log('on reset');
    const translationsArray = this.couponForm.get('translations') as FormArray;
    translationsArray.clear();

    this.couponForm.patchValue({
      name: '',
      city: '',
      latitude: 0,
      longitude: 0,
      type: 'Point',
      allRestaurants: true,
      allUsers: true,
      code: '',
      limitSameUser: '',
      start: '',
      expires: '',
      discountType: 'amount',
      minDiscount: '',
      availability: 'breakfast',
      preBookingChargeRequired: false,
      createdById: '',
    });

    this.couponForm.get('restaurant')?.reset('');
    this.couponForm.get('restaurant')?.disable();
    this.couponForm.get('user')?.reset('');
    this.couponForm.get('user')?.disable();
    this.couponForm.get('maxDiscount')?.reset('');
    this.couponForm.get('maxDiscount')?.disable();
    this.couponForm.get('preBookingChargeAmount')?.reset('');
    this.couponForm.get('preBookingChargeAmount')?.disable();

    this.savedUsers = [];
    this.restauantIds = [];

    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;

    this.haveSubmitClicked = false;
    this.isSubmit = false;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    console.log('selected restaurant id --> ', this.restauantIds);
    const locale = this.couponForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.couponForm);
    if (this.couponForm.valid) {
      if (this.action == 'add') {
        this.saveCoupon();
      } else {
        this.updateCoupon();
      }
    }
  }

  saveCoupon() {
    console.log('on save');
    const raw = this.couponForm.getRawValue();
    this.restauantIds = Array.from(new Set(this.restauantIds));
    const sendData = {
      ...raw,
      restaurant: this.restauantIds.join(',')
    };
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/dining_coupon/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_coupon_added');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateCoupon() {
    console.log('on update');
    const raw = this.couponForm.getRawValue();
    this.restauantIds = Array.from(new Set(this.restauantIds));
    const sendData = {
      ...raw,
      restaurant: this.restauantIds.join(',')
    };
    console.log(sendData);
    const spinnerRef = this.util.start('ts_updating');
    this.api.patch_private('v1/admin/dining_coupon/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_coupon_updated');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  displayUserName(user: UserSearchListInterface) {
    return user && user.id ? `${user.firstName} ${user.lastName}` : '';
  }

  onUserSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
  }

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.couponForm.controls['city'].setValue(event.option.value);
      const selectedCity = this.listOfCities.filter(x => x.id == this.couponForm.value.city);
      console.log('/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/', selectedCity);
      if (selectedCity && selectedCity.length && selectedCity.length > 0) {
        this.couponForm.controls['latitude'].setValue(selectedCity[0].location.coordinates[1]);
        this.couponForm.controls['longitude'].setValue(selectedCity[0].location.coordinates[0]);
        this.getRestaurants(selectedCity[0].id);
      }
    }
  }

  openedChange(e: any) {
    this.restaurantCtrl.patchValue('');
  }

  getRestaurants(id: string) {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/restaurant/getRestaurantByCityIdLimitedData/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
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
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  async onUserModal() {
    if (this.couponForm.controls['allUsers'].value == false) {
      console.log('open modal');
      const dialogRef = await this.dialog.open(DialogDiningCouponUsers, {
        data: { value: this.savedUsers },
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
        if (result && result.saved && result.saved && result.saved.length) {
          this.savedUsers = result.saved;
          console.log('---------------', this.savedUsers);
          const ids = this.savedUsers.map(element => element.id);
          console.log('ids ---> ', ids);
          this.couponForm.controls['user'].patchValue(ids.join(','));
          let other = '';
          if (this.savedUsers.length >= 2) {
            other = `(+ ${(this.savedUsers.length - 1)} other)`;
          }
          this.userCtrl.setValue(this.savedUsers[0].firstName + ' ' + this.savedUsers[0].lastName + ' ' + other)
        } else {
          this.savedUsers = [];
          this.userCtrl.setValue('');
          this.couponForm.controls['user'].patchValue('');
        }
      });
    }
  }

  onUserDropDownSelect(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.userCtrl.enable();
      this.userCtrl.setValidators([Validators.required]);
      this.couponForm.controls['user'].enable();
      this.couponForm.controls['user'].setValidators([Validators.required]);
    } else {
      this.savedUsers = [];
      this.userCtrl.setValue('');
      this.couponForm.controls['user'].patchValue('');
      this.userCtrl.disable();
      this.userCtrl.clearValidators();
      this.couponForm.controls['user'].disable();
      this.couponForm.controls['user'].clearValidators();
    }
  }

  onRestaurantDropDownSelect(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == false) {
      this.restaurantCtrl.enable();
      this.restaurantCtrl.setValidators([Validators.required]);
      this.couponForm.controls['restaurant'].enable();
      this.couponForm.controls['restaurant'].setValidators([Validators.required]);
    } else {
      this.restauantIds = [];
      this.couponForm.controls['restaurant'].patchValue([]);
      this.restaurantCtrl.disable();
      this.restaurantCtrl.clearValidators();
      this.couponForm.controls['restaurant'].disable();
      this.couponForm.controls['restaurant'].clearValidators();
    }
  }

  selectionChange(event: MatOptionSelectionChange, item: AdminRestaurantListLimitedInfoInterface) {
    console.log(event, item);
    if (event && event.source.selected == true) {
      this.restauantIds.push(item.id);
    } else {
      this.restauantIds = this.restauantIds.filter((x: any) => x != item.id);
    }
  }

  onDiscountTypeChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'percentage') {
      this.couponForm.controls['maxDiscount'].enable();
      this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
    } else {
      this.couponForm.controls['maxDiscount'].disable();
      this.couponForm.controls['maxDiscount'].clearValidators();
    }
  }

  onPreBookingChargeChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.couponForm.controls['preBookingChargeAmount'].enable();
      this.couponForm.controls['preBookingChargeAmount'].setValidators([Validators.required]);
    } else {
      this.couponForm.controls['preBookingChargeAmount'].disable();
      this.couponForm.controls['preBookingChargeAmount'].clearValidators();
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
