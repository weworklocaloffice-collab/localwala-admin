import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { map, Observable, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CityzenMediaImagesDialog } from 'src/app/pages/city-master-team/cityzen-media-images-dialog/cityzen-media-images-dialog';
import { CityzenFoodListForTiffinPackageInterface } from 'src/app/interfaces/cityzen.food.list.for.tiffin.package.interface';
import { CityzenSubscriptionTiffinNoticeInterface } from 'src/app/interfaces/cityzen.subscription.tiffin.notice.interface';
import { CityzenWeekListForSubscriptionInterface } from 'src/app/interfaces/cityzen.week.list.for.subscription.interface';
import { CityzenSlotListForSubscriptionTiffinInterface } from 'src/app/interfaces/cityzen.slot.list.for.subscription.tiffin.interface';
import { CityzenRestaurantListForTiffinPackagesInterface, RestaurantLocality } from 'src/app/interfaces/cityzen.restaurant.list.for.tiffin.packages.interface';
import { DialogCityzenTiffinTimeslot } from './dialog-cityzen-tiffin-timeslot/dialog-cityzen-tiffin-timeslot';
import { DialogCityzenTiffinNotice } from './dialog-cityzen-tiffin-notice/dialog-cityzen-tiffin-notice';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-manage-tiffin-subscription-package',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-manage-tiffin-subscription-package.html',
})
export class CityzenManageTiffinSubscriptionPackage {

  action: string = 'add';
  id: string = '';
  packageForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    restaurant: new FormControl('', [Validators.required]),
    foods: new FormControl('', [Validators.required]),
    interval: new FormControl('week', [Validators.required]),
    offDays: new FormControl(''),
    totalOrder: new FormControl({ value: 7, disabled: true }, Validators.required),
    available: new FormControl('breakfast', [Validators.required]),
    timeSlots: new FormArray([], [Validators.required]),
    orderTo: new FormControl('homedelivery', [Validators.required]),
    deliveryArea: new FormControl('', [Validators.required]),
    canSelectAddon: new FormControl(false),
    canSelectVariation: new FormControl(false),
    price: new FormControl('', [Validators.required]),
    discountType: new FormControl('%', [Validators.required]),
    discount: new FormControl(''),
    notice: new FormArray([]),
    translations: new FormArray([]),
    status: new FormControl('')
  });
  displayedNoticeColumn = ['name', 'action'];
  displayedFoodColumn = ['name', 'price', 'discount', 'addons', 'variations', 'action'];
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  foods: Observable<CityzenFoodListForTiffinPackageInterface[]>;
  listOfFoods: CityzenFoodListForTiffinPackageInterface[] = [];
  foodCtrl = new FormControl('');
  foodInPackage: CityzenFoodListForTiffinPackageInterface[] = [];
  foodIdInPackage: string[] = [];
  noticeArray: CityzenSubscriptionTiffinNoticeInterface[] = [];
  weekList: Observable<CityzenWeekListForSubscriptionInterface[]>;
  listOfWeek: CityzenWeekListForSubscriptionInterface[] = [];
  weekCtrl = new FormControl('');
  slotList: CityzenSlotListForSubscriptionTiffinInterface[] = [];
  restaurants: Observable<CityzenRestaurantListForTiffinPackagesInterface[]>;
  listOfRestaurants: CityzenRestaurantListForTiffinPackagesInterface[] = [];
  restaurantCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    const restaurantId = this.route.snapshot.paramMap.get('restaurant') ? this.route.snapshot.paramMap.get('restaurant') : '';

    this.getWeekList();
    if (this.id && this.action == 'edit' && restaurantId) {
      console.log('restaurant id --> ', restaurantId);
      this.packageForm.controls['restaurant'].setValue(restaurantId);
      this.getInfo();
    } else {
      this.getRestaurantByCity();
      this.locale();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/tiffin_package_details/' + this.id + '/' + this.packageForm.controls['restaurant'].value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.info && response.info.id == this.id) {
          const detail = response.info;
          this.packageForm.controls['available'].setValue(detail.available);
          this.packageForm.controls['canSelectAddon'].setValue(detail.canSelectAddon);
          this.packageForm.controls['canSelectVariation'].setValue(detail.canSelectVariation);
          this.packageForm.controls['deliveryArea'].setValue(detail.deliveryArea);
          this.packageForm.controls['discount'].setValue(detail.discount);
          this.packageForm.controls['discountType'].setValue(detail.discountType);
          this.packageForm.controls['image'].setValue(detail.image);
          this.packageForm.controls['interval'].setValue(detail.interval);
          this.packageForm.controls['name'].setValue(detail.name);
          this.packageForm.controls['orderTo'].setValue(detail.orderTo);
          this.packageForm.controls['price'].setValue(detail.price);
          this.packageForm.controls['shortDescription'].setValue(detail.shortDescription);
          this.packageForm.controls['totalOrder'].setValue(detail.totalOrder);
          this.packageForm.controls['restaurant'].setValue(detail.restaurant);
          if (detail && detail.translations && detail.translations instanceof Array) {

            this.translations = detail.translations;
            this.locale();
          }
          if (detail && detail.timeSlots && detail.timeSlots instanceof Array) {
            this.slotList = detail.timeSlots;
            this.slotList = [...this.slotList];
            const slots = this.packageForm.get('timeSlots') as FormArray;
            slots.clear();
            this.slotList.forEach((element) => {
              slots.push(this.fb.group({ startTime: [element.startTime], endTime: [element.endTime] }));
            });
          }

          if (detail.orderTo == 'homedelivery') {
            console.log('Home Delivery Only');
            this.packageForm.controls['deliveryArea'].setValidators([Validators.required]);
            this.packageForm.controls['deliveryArea'].enable();
            this.packageForm.controls['deliveryArea'].setValue(detail.deliveryArea);
          } else if (detail.orderTo == 'selfpickup') {
            console.log('Self Pickup Only');
            this.packageForm.controls['deliveryArea'].clearValidators();
            this.packageForm.controls['deliveryArea'].disable();
            this.packageForm.controls['deliveryArea'].setValue('');
          }

          if (detail && detail.notice && detail.notice instanceof Array) {
            console.log(detail.notice);
            const mappedList = detail.notice.map(
              (item: CityzenSubscriptionTiffinNoticeInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.value || item.name;
                } else {
                  item.displayName = item?.name || '';
                }
                return item;
              }
            );
            this.noticeArray = mappedList;
            this.noticeArray = [...this.noticeArray];
            const notices = this.packageForm.get('notice') as FormArray;
            notices.clear();
            this.noticeArray.forEach((element) => {
              notices.push(this.fb.group({ name: [element.name], translations: [element.translations] }));
            });
          }

          if (detail && detail.offDays && detail.offDays instanceof Array) {
            console.log(detail.offDays);
            const savedWeeks: any = [];
            this.listOfWeek.forEach((element) => {
              if (detail.offDays.includes(element.key)) {
                savedWeeks.push(element.name);
              }
            });
            this.packageForm.controls['offDays'].patchValue(savedWeeks);
          }

          if (response && response.food) {
            const mappedList = response.food.map(
              (item: CityzenFoodListForTiffinPackageInterface) => {
                if (item.translations) {
                  const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                  item.displayName = translation?.title || item.name;
                } else {
                  item.displayName = item?.name || '';
                }
                return item;
              }
            );
            this.listOfFoods = mappedList;
            this.foods = this.foodCtrl.valueChanges.pipe(
              startWith(''),
              map((element) => (element ? this._filterFoods(element) : this.listOfFoods.slice()))
            );
            console.log(this.foods);
          }

          this.foodIdInPackage = detail.foods;
          this.listOfFoods.forEach((element) => {
            if (this.foodIdInPackage.includes(element.id)) {
              this.foodInPackage.push(element);
            }
          });
          this.foodInPackage = [...this.foodInPackage];
          console.log(this.foodIdInPackage.join(','));
          this.packageForm.controls['foods'].setValue(this.foodIdInPackage.join(','));
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  getWeekList() {
    this.api.getLocalAssets('weekList.json').then((response: any) => {
      console.log(response);
      if (response && response) {
        this.listOfWeek = response;
        this.weekList = this.weekCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterWeek(element) : this.listOfWeek.slice()))
        );
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterWeek(value: string): CityzenWeekListForSubscriptionInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfWeek.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }


  private _filterFoods(value: any): CityzenFoodListForTiffinPackageInterface[] {
    console.log(value);
    let filterValue: string;
    if (value && value.displayName) {
      filterValue = value.displayName;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listOfFoods.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  getRestaurantByCity() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_cityzen/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants && response.restaurants) {
          const mappedList = response.restaurants.map(
            (item: CityzenRestaurantListForTiffinPackagesInterface) => {
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

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.packageForm.controls['restaurant'].setValue(event.option.value);
      this.getFoodsByRestaurants(event.option.value);
    }
  }

  getFoodsByRestaurants(id: string) {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/food_list_for_tiffin_packages/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.foods) {
          const mappedList = response.foods.map(
            (item: CityzenFoodListForTiffinPackageInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfFoods = mappedList;
          this.foods = this.foodCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoods(element) : this.listOfFoods.slice()))
          );
          console.log(this.foods);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterRestaurant(value: any): CityzenRestaurantListForTiffinPackagesInterface[] {
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

  getTranslateRestaurantName(item: CityzenRestaurantListForTiffinPackagesInterface): string {
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

  displayFoodName(food: CityzenFoodListForTiffinPackageInterface) {
    return food && food.name ? food.name : '';
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

  onAddFoodToPackage() {
    console.log('value', this.foodCtrl);
    let selectedFood: any = this.foodCtrl.value;
    console.log(selectedFood);
    if (selectedFood && selectedFood.id) {
      this.foodIdInPackage.push(selectedFood.id);
      this.foodInPackage.push(selectedFood);
      this.foodInPackage = [...this.foodInPackage];
      console.log(this.foodIdInPackage.join(','));
      this.packageForm.controls['foods'].setValue(this.foodIdInPackage.join(','));
    }
    console.log(this.foodInPackage);
    this.foodCtrl.setValue('');
  }

  onDeleteFoodFromPackage(food: CityzenFoodListForTiffinPackageInterface) {
    console.log(food);
    this.foodInPackage = this.foodInPackage.filter(x => x.id != food.id);
    this.foodInPackage = [...this.foodInPackage];
    this.foodIdInPackage = this.foodIdInPackage.filter(x => x != food.id);
    this.packageForm.controls['foods'].setValue(this.foodIdInPackage.join(','));
  }

  onSubmit() {
    console.log('submit');
    console.log(this.packageForm);
    console.log(this.action);
    this.haveSubmitClicked = true;
    const locale = this.packageForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], shortDescription: [element.shortDescription] }));
    });

    if (this.packageForm.valid) {
      console.log('on submit');
      if (this.action == 'add') {
        this.savePackage();
      } else {
        this.updatePackage();
      }
    }
  }

  savePackage() {
    console.log('Save Package');
    console.log(this.packageForm.getRawValue());
    const offDays: any[] = [];
    const sendData = this.packageForm.getRawValue();
    this.listOfWeek.forEach((element) => {
      if (sendData.offDays && sendData.offDays.includes(element.name)) {
        offDays.push(element.key);
      }
    });
    sendData.offDays = offDays.join(',');
    console.log(sendData);
    sendData.status = 'live';
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/cityzen/create_tiffin_package', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_package_added');
        this.router.navigate(['cityzen-team/subscription-tiffin-package']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  updatePackage() {
    console.log('Update Package');
    console.log(this.packageForm.getRawValue());
    const offDays: any[] = [];
    const sendData = this.packageForm.getRawValue();
    this.listOfWeek.forEach((element) => {
      if (sendData.offDays && sendData.offDays.includes(element.name)) {
        offDays.push(element.key);
      }
    });
    sendData.offDays = offDays.join(',');
    console.log(sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/cityzen/update_tiffin_package/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_package_updated');
        this.router.navigate(['cityzen-team/subscription-tiffin-package']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  get f() {
    return this.packageForm.controls;
  }

  onReset() {
    console.log('On Reset');
    this.packageForm.patchValue({
      name: '',
      shortDescription: '',
      image: '',
      restaurant: '',
      foods: '',
      interval: 'week',
      offDays: '',
      totalOrder: 7,
      available: 'breakfast',
      orderTo: 'homedelivery',
      deliveryArea: '',
      canSelectAddon: false,
      canSelectVariation: false,
      price: '',
      discountType: '%',
      discount: '',
      status: ''
    });

    (this.packageForm.get('timeSlots') as FormArray).clear();
    (this.packageForm.get('notice') as FormArray).clear();
    (this.packageForm.get('translations') as FormArray).clear();

    this.foodIdInPackage = [];
    this.foodInPackage = [];
    this.noticeArray = [];
    this.slotList = [];

    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;

    this.haveSubmitClicked = false;
    console.log(this.packageForm.getRawValue());
  }

  intervalChange(event: MatSelectChange) {
    console.log(event);
    if (event.value == 'week') {
      this.packageForm.controls['totalOrder'].setValue(7);
    } else if (event.value == 'fortnight') {
      this.packageForm.controls['totalOrder'].setValue(15);
    } else if (event.value == 'month') {
      this.packageForm.controls['totalOrder'].setValue(30);
    }
  }

  orderToChange(event: MatSelectChange) {
    console.log(event);
    if (event.value == 'homedelivery') {
      console.log('Home Delivery Only');
      this.packageForm.controls['deliveryArea'].setValidators([Validators.required]);
      this.packageForm.controls['deliveryArea'].enable();
      this.packageForm.controls['deliveryArea'].setValue('');
    } else if (event.value == 'selfpickup') {
      console.log('Self Pickup Only');
      this.packageForm.controls['deliveryArea'].clearValidators();
      this.packageForm.controls['deliveryArea'].disable();
      this.packageForm.controls['deliveryArea'].setValue('');
    }
  }

  onAddNotice() {
    console.log('On Add Notice');
    const dialogRef = this.dialog.open(DialogCityzenTiffinNotice, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add') {
        this.noticeArray.push(result.data);
        const mappedList = this.noticeArray.map(
          (item: CityzenSubscriptionTiffinNoticeInterface) => {
            if (item.translations) {
              const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
              item.displayName = translation?.value || item.name;
            } else {
              item.displayName = item?.name || '';
            }
            return item;
          }
        );
        this.noticeArray = mappedList;
        this.noticeArray = [...this.noticeArray];
        console.log(this.noticeArray);
        const notices = this.packageForm.get('notice') as FormArray;
        notices.clear();
        this.noticeArray.forEach((element) => {
          notices.push(this.fb.group({ name: [element.name], translations: [element.translations] }));
        });
      }
    });
  }

  onDeleteNotice(notice: CityzenSubscriptionTiffinNoticeInterface) {
    console.log(notice);
    this.noticeArray = this.noticeArray.filter(x => x.name != notice.name);
    this.noticeArray = [...this.noticeArray];
    const notices = this.packageForm.get('notice') as FormArray;
    notices.clear();
    this.noticeArray.forEach((element) => {
      notices.push(this.fb.group({ name: [element.name], translations: [element.translations] }));
    });
  }

  onEditNotice(notice: CityzenSubscriptionTiffinNoticeInterface) {
    const dialogRef = this.dialog.open(DialogCityzenTiffinNotice, {
      data: { action: 'edit', values: notice },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        const index = this.noticeArray.findIndex((element) => element.name == notice.name);
        console.log(`Index --> ${index}`);
        if (index != -1) {
          this.noticeArray[index] = result.data;
          const mappedList = this.noticeArray.map(
            (item: CityzenSubscriptionTiffinNoticeInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.noticeArray = mappedList;
          this.noticeArray = [...this.noticeArray];
          const notices = this.packageForm.get('notice') as FormArray;
          notices.clear();
          this.noticeArray.forEach((element) => {
            notices.push(this.fb.group({ name: [element.name], translations: [element.translations] }));
          });
        }
      }
    });
  }

  onAddSlot() {
    console.log('add slot');
    const dialogRef = this.dialog.open(DialogCityzenTiffinTimeslot, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'add' && result.data && result.data.startTime && result.data.endTime) {
        const obj = {
          startTime: result.data.startTime,
          endTime: result.data.endTime
        };
        console.log(obj);
        this.slotList.push(obj);
        this.slotList = [...this.slotList];
        console.log(this.slotList);
        const slots = this.packageForm.get('timeSlots') as FormArray;
        slots.clear();
        this.slotList.forEach((element) => {
          slots.push(this.fb.group({ startTime: [element.startTime], endTime: [element.endTime] }));
        });
        console.log(this.packageForm.controls['timeSlots'].value);
      }
    });
  }

  onEditSlot(slot: CityzenSlotListForSubscriptionTiffinInterface) {
    console.log('Edit Slot');
    console.log(slot);
    const dialogRef = this.dialog.open(DialogCityzenTiffinTimeslot, {
      data: { action: 'edit', values: slot },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update' && result.data && result.data.startTime && result.data.endTime) {
        console.log('Update Value ---');
        console.log('old value ', slot);
        console.log('update value ', result.data);
        const index = this.slotList.findIndex((x) => x.startTime == slot.startTime && x.endTime == slot.endTime);
        console.log('0000 Index --> ', index);
        if (index != -1) {
          this.slotList[index].startTime = result.data.startTime;
          this.slotList[index].endTime = result.data.endTime;
          this.slotList = [...this.slotList];
          const slots = this.packageForm.get('timeSlots') as FormArray;
          slots.clear();
          this.slotList.forEach((element) => {
            slots.push(this.fb.group({ startTime: [element.startTime], endTime: [element.endTime] }));
          });
          console.log(this.packageForm.controls['timeSlots'].value);
        }
      }
    });
  }

  onDeleteSlot(slot: CityzenSlotListForSubscriptionTiffinInterface) {
    console.log('Delete Slot');
    console.log(slot);
    this.slotList = this.slotList.filter((x) => x.startTime != slot.startTime && x.endTime != slot.endTime);
    this.slotList = [...this.slotList];
    const slots = this.packageForm.get('timeSlots') as FormArray;
    slots.clear();
    this.slotList.forEach((element) => {
      slots.push(this.fb.group({ startTime: [element.startTime], endTime: [element.endTime] }));
    });
    console.log(this.packageForm.controls['timeSlots'].value);
  }

  onImageClick() {
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
      data: { value: this.packageForm.controls['image'].value },
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
        this.packageForm.controls['image'].setValue(result.data);
      }
    });
  }

  onFoodDetail(id: string) {
    this.router.navigate(['cityzen-team/u/food-detail', id]);
  }

}
