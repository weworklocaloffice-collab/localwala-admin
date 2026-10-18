import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable, startWith, map } from 'rxjs';
import { UserSearchListInterface } from 'src/app/interfaces/user.search.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { CityzenRestaurantListLimitedInfoInterface } from 'src/app/interfaces/cityzen.restaurant.list.limited.info.interface';
import { DialogCityzenCouponUser } from './dialog-cityzen-coupon-user/dialog-cityzen-coupon-user';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-cityzen-manage-coupon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './cityzen-manage-coupon.html',
})
export class CityzenManageCoupon {

  action: string = 'add';
  couponForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    couponType: new FormControl('default', [Validators.required]),
    allRestaurants: new FormControl(true),
    restaurant: new FormControl({ value: '', disabled: true }),
    allUsers: new FormControl(true),
    user: new FormControl({ value: '', disabled: true }),
    code: new FormControl('', [Validators.required]),
    limitSameUser: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    expires: new FormControl('', [Validators.required]),
    discountType: new FormControl('amount', [Validators.required]),
    minDiscount: new FormControl('', [Validators.required]),
    maxDiscount: new FormControl({ value: '', disabled: true }),
    minCartTotal: new FormControl('', [Validators.required]),
    loyalityPoints: new FormControl({ value: '', disabled: true }),
    createdById: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;
  savedUsers: UserSearchListInterface[] = [];
  userCtrl = new FormControl({ value: '', disabled: true });
  restaurants: Observable<CityzenRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: CityzenRestaurantListLimitedInfoInterface[] = [];
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
    if (userId && userId !== null && userId !== '') {
      this.couponForm.controls['createdById'].setValue(userId);
    }
    if (this.id && this.action == 'edit') {
      this.getInfo();
    } else {
      this.getRestaurants();
      this.locale();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/coupon_deep_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.info && response.info.id && response.info.id == this.id) {
          const info = response.info;
          this.couponForm.controls['allRestaurants'].patchValue(info.allRestaurants);
          this.couponForm.controls['allUsers'].patchValue(info.allUsers);
          this.couponForm.controls['code'].patchValue(info.code);
          this.couponForm.controls['couponType'].patchValue(info.couponType);
          this.couponForm.controls['discountType'].patchValue(info.discountType);
          this.couponForm.controls['limitSameUser'].patchValue(info.limitSameUser);
          this.couponForm.controls['loyalityPoints'].patchValue(info.loyalityPoints);
          this.couponForm.controls['maxDiscount'].patchValue(info.maxDiscount);
          this.couponForm.controls['minCartTotal'].patchValue(info.minCartTotal);
          this.couponForm.controls['minDiscount'].patchValue(info.minDiscount);
          this.couponForm.controls['name'].patchValue(info.name);
          if (info && info.discountType == 'percentage') {
            this.couponForm.controls['maxDiscount'].enable();
            this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
          } else {
            this.couponForm.controls['maxDiscount'].disable();
            this.couponForm.controls['maxDiscount'].clearValidators();
          }
          if (info && info.allRestaurants == false) {
            this.restaurantCtrl.enable();
            this.restaurantCtrl.setValidators([Validators.required]);
            this.couponForm.controls['restaurant'].enable();
            this.couponForm.controls['restaurant'].setValidators([Validators.required]);
          } else {
            this.restauantIds = [];
            this.couponForm.controls['restaurant'].patchValue('');
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
          if (info.couponType == 'loyality') {
            this.couponForm.controls['loyalityPoints'].enable();
            this.couponForm.controls['loyalityPoints'].setValidators([Validators.required]);
          } else if (info.couponType != 'loyality') {
            this.couponForm.controls['loyalityPoints'].disable();
            this.couponForm.controls['loyalityPoints'].clearValidators();
          }
          if (info.couponType == 'bogo') {
            this.couponForm.controls['minDiscount'].disable();
            this.couponForm.controls['maxDiscount'].disable();
            this.couponForm.controls['minCartTotal'].disable();
            this.couponForm.controls['loyalityPoints'].disable();
          } else if (info.couponType != 'bogo') {
            this.couponForm.controls['minDiscount'].enable();
            this.couponForm.controls['minDiscount'].setValidators([Validators.required]);
            this.couponForm.controls['maxDiscount'].enable();
            this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
            this.couponForm.controls['minCartTotal'].enable();
            this.couponForm.controls['minCartTotal'].setValidators([Validators.required]);
            this.couponForm.controls['loyalityPoints'].enable();
            this.couponForm.controls['loyalityPoints'].setValidators([Validators.required]);
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

  onCouponChange(event: MatSelectChange) {
    console.log(event);
    if (event.value == 'loyality') {
      this.couponForm.controls['loyalityPoints'].enable();
      this.couponForm.controls['loyalityPoints'].setValidators([Validators.required]);
    } else if (event.value != 'loyality') {
      this.couponForm.controls['loyalityPoints'].disable();
      this.couponForm.controls['loyalityPoints'].clearValidators();
    }

    if (event.value == 'bogo') {
      this.couponForm.controls['minDiscount'].disable();
      this.couponForm.controls['maxDiscount'].disable();
      this.couponForm.controls['minCartTotal'].disable();
      this.couponForm.controls['loyalityPoints'].disable();
    } else if (event.value != 'bogo') {
      this.couponForm.controls['minDiscount'].enable();
      this.couponForm.controls['minDiscount'].setValidators([Validators.required]);
      this.couponForm.controls['maxDiscount'].enable();
      this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
      this.couponForm.controls['minCartTotal'].enable();
      this.couponForm.controls['minCartTotal'].setValidators([Validators.required]);
      this.couponForm.controls['loyalityPoints'].enable();
      this.couponForm.controls['loyalityPoints'].setValidators([Validators.required]);
    }
  }

  get f() {
    return this.couponForm.controls;
  }

  onReset() {
    console.log('on reset');
    this.couponForm.patchValue({
      name: '',
      couponType: 'default',
      allRestaurants: true,
      restaurant: '',
      allUsers: true,
      user: '',
      code: '',
      limitSameUser: '',
      start: '',
      expires: '',
      discountType: 'amount',
      minDiscount: '',
      maxDiscount: '',
      minCartTotal: '',
      loyalityPoints: '',
      createdById: ''
    });

    this.couponForm.get('restaurant')?.disable();
    this.couponForm.get('user')?.disable();
    this.couponForm.get('maxDiscount')?.disable();
    this.couponForm.get('loyalityPoints')?.disable();

    const translations = this.couponForm.get('translations') as FormArray;
    translations.clear();

    this.savedUsers = [];
    this.restauantIds = [];
    this.haveSubmitClicked = false;
    this.isSubmit = false;
    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;
    console.log(this.couponForm.getRawValue());
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
    const sendData = this.couponForm.getRawValue();
    this.restauantIds = Array.from(new Set(this.restauantIds));
    sendData.restaurant = this.restauantIds.join();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/cityzen/create_coupon/' + this.util.getItem('_uid'), sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_coupon_added');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  updateCoupon() {
    console.log('on update');
    const sendData = this.couponForm.getRawValue();
    this.restauantIds = Array.from(new Set(this.restauantIds));
    sendData.restaurant = this.restauantIds.join();
    console.log(sendData);
    const spinnerRef = this.util.start('ts_updating');
    this.api.patch_private('v1/cityzen/update_coupon/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_coupon_updated');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  displayUserName(user: UserSearchListInterface) {
    return user && user.id ? `${user.firstName} ${user.lastName}` : '';
  }

  onUserSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
  }

  openedChange(e: any) {
    this.restaurantCtrl.patchValue('');
  }

  getRestaurants() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_cityzen/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
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
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterRestaurant(value: any): CityzenRestaurantListLimitedInfoInterface[] {
    let filterValue: string;
    if (value && value.name) {
      filterValue = value.name;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfRestaurants.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
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
      this.couponForm.controls['restaurant'].patchValue('');
      this.restaurantCtrl.disable();
      this.restaurantCtrl.clearValidators();
      this.couponForm.controls['restaurant'].disable();
      this.couponForm.controls['restaurant'].clearValidators();
    }
  }

  async onUserModal() {
    if (this.couponForm.controls['allUsers'].value == false) {
      console.log('open modal');
      const dialogRef = await this.dialog.open(DialogCityzenCouponUser, {
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

  selectionChange(event: MatOptionSelectionChange, item: CityzenRestaurantListLimitedInfoInterface) {
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

}
