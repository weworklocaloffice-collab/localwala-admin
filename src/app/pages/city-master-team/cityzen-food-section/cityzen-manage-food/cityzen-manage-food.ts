import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { CityzenAddonsListForFoodInterface } from 'src/app/interfaces/cityzen.addons.list.for.foods.interface';
import { CityzenFoodTaxationInfoInterface } from 'src/app/interfaces/cityzen.food.taxation.info.interface';
import { CityzenMainCategoryListForFoodsInterface } from 'src/app/interfaces/cityzen.main.category.list.for.foods.interface';
import { CityzenRestaurantListLimitedInfoInterface, RestaurantLocality } from 'src/app/interfaces/cityzen.restaurant.list.limited.info.interface';
import { CityzenSubCategoryListForFoodInterface } from 'src/app/interfaces/cityzen.sub.category.list.for.food.interface';
import { CityzenVendorCustomCategoryListForFoodInterface } from 'src/app/interfaces/cityzen.vendor.custom.category.list.for.food.interface';
import { CityzenVendorCustomSubCategoryListForFoodInterface } from 'src/app/interfaces/cityzen.vendor.custom.sub.category.list.for.food.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CityzenMediaImagesDialog } from 'src/app/pages/city-master-team/cityzen-media-images-dialog/cityzen-media-images-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-manage-food',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './cityzen-manage-food.html',
})
export class CityzenManageFood {

  @ViewChild('addonInput') addonInput: ElementRef<HTMLInputElement>;
  action: string = 'add';
  id: string = '';
  foodForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    shortDescription: new FormControl('', [Validators.required]),
    restaurant: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    ownCategory: new FormControl(false, [Validators.required]),
    category: new FormControl('', [Validators.required]),
    subCategory: new FormControl(''),
    customCategory: new FormControl(''),
    customSubCategory: new FormControl(''),
    foodType: new FormControl('none', [Validators.required]),
    addons: new FormControl(''),
    startTime: new FormControl(''),
    endTime: new FormControl(''),
    price: new FormControl('', [Validators.required]),
    discountType: new FormControl('%', [Validators.required]),
    discount: new FormControl(''),
    purchaseLimit: new FormControl(''),
    translations: new FormArray([]),
    variations: new FormArray<FormGroup>([]),
    tags: new FormArray<FormControl<string>>([]),
    taxationEnable: new FormControl(false),
    foodTax: new FormControl(),
    status: new FormControl('live'),
    stockType: new FormControl('unlimited', [Validators.required]),
    stockNumber: new FormControl('-1', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  addonsList: Observable<CityzenAddonsListForFoodInterface[]>;
  listOfAddons: CityzenAddonsListForFoodInterface[] = [];
  addonsCtrl = new FormControl('');
  taxationList: Observable<CityzenFoodTaxationInfoInterface[]>;
  listOfTaxation: CityzenFoodTaxationInfoInterface[] = [];
  taxationCtrl = new FormControl('');
  vendorCategoryList: Observable<CityzenVendorCustomCategoryListForFoodInterface[]>;
  listOfVendorCategory: CityzenVendorCustomCategoryListForFoodInterface[] = [];
  vendorCategoryCtrl = new FormControl('');
  vendorSubCategoryList: Observable<CityzenVendorCustomSubCategoryListForFoodInterface[]>;
  listOfVendorSubCategory: CityzenVendorCustomSubCategoryListForFoodInterface[] = [];
  vendorSubCategoryCtrl = new FormControl('');
  tempVendorSubCategoryId: string = '';
  mainCategoryList: Observable<CityzenMainCategoryListForFoodsInterface[]>;
  listOfMainCategory: CityzenMainCategoryListForFoodsInterface[] = [];
  mainCategoryCtrl = new FormControl('');
  mainSubCategoryList: Observable<CityzenSubCategoryListForFoodInterface[]>;
  listOfMainSubCategory: CityzenSubCategoryListForFoodInterface[] = [];
  mainSubCategoryCtrl = new FormControl('');
  tempMainSubCategoryId: string = '';
  haveCustomCatetgoryFeature: boolean = false;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tagList: any[] = [];
  addonList: any[] = [];
  restaurants: Observable<CityzenRestaurantListLimitedInfoInterface[]>;
  listOfRestaurants: CityzenRestaurantListLimitedInfoInterface[] = [];
  restaurantCtrl = new FormControl('');

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getInfo();
    } else {
      this.foodForm.controls['foodTax'].clearValidators();
      this.foodForm.controls['foodTax'].disable();
      this.foodForm.controls['foodTax'].patchValue('');

      this.foodForm.controls['stockNumber'].clearValidators();
      this.foodForm.controls['stockNumber'].disable();
      this.foodForm.controls['stockNumber'].patchValue('-1');
      this.getRestaurants();
      this.locale();
    }
  }


  getInfo() {
    console.log('get info by Id');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/food_deep_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restDetails && response.restDetails.id) {
          this.foodForm.controls['restaurant'].setValue(response.restDetails.id);
          if (response.restDetails.customCategory != null && response.restDetails.customCategory == true) {
            this.haveCustomCatetgoryFeature = true;
          } else {
            this.haveCustomCatetgoryFeature = false;
          }
        }
        if (response && response.addons && response.addons.length) {
          this.listOfAddons = response.addons;
          this.addonsList = this.addonsCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterAddons(element) : this.listOfAddons.slice()))
          );
          const values = response.foodInfo;
          if (values && values.id == this.id) {
            if (values && values.addons && values.addons instanceof Array) {
              const tempAddons: any = [];
              this.listOfAddons.forEach(element => {
                if (values.addons.includes(element.id)) {
                  tempAddons.push(element.name);
                }
              });
              this.foodForm.controls['addons'].patchValue(tempAddons);
            }
          }
        }

        if (response && response.taxation && response.taxation.length) {
          this.listOfTaxation = response.taxation;
          this.taxationList = this.taxationCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoodTaxation(element) : this.listOfTaxation.slice()))
          );
          const values = response.foodInfo;

          if (values && values.foodTax && values.foodTax instanceof Array) {
            const tempTaxes: any[] = [];
            this.listOfTaxation.forEach(element => {
              if (values.foodTax.includes(element.id)) {
                tempTaxes.push(element.taxName);
              }
            });
            this.foodForm.controls['foodTax'].patchValue(tempTaxes);
          }
        }

        if (response && response.category && response.category.length) {
          const mappedList = response.category.map(
            (item: CityzenMainCategoryListForFoodsInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfMainCategory = mappedList;
          this.mainCategoryList = this.mainCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterMainCategory(element) : this.listOfMainCategory.slice()))
          );
        }

        if (response && response.vendorCategory && response.vendorCategory.length) {
          const mappedList = response.vendorCategory.map(
            (item: CityzenVendorCustomCategoryListForFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfVendorCategory = mappedList;
          this.vendorCategoryList = this.vendorCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCustomCategory(element) : this.listOfVendorCategory.slice()))
          );
        }

        const values = response.foodInfo;
        console.log(values);
        if (values && values.id == this.id) {
          this.foodForm.controls['name'].setValue(values.name);
          this.foodForm.controls['shortDescription'].setValue(values.shortDescription);
          this.foodForm.controls['image'].setValue(values.image);
          this.foodForm.controls['ownCategory'].setValue(values.ownCategory);
          this.foodForm.controls['price'].setValue(values.price);
          this.foodForm.controls['purchaseLimit'].setValue(values.purchaseLimit);
          this.foodForm.controls['discount'].setValue(values.discount);
          this.foodForm.controls['discountType'].setValue(values.discountType);
          this.foodForm.controls['foodType'].setValue(values.foodType);
          this.foodForm.controls['startTime'].setValue(values.startTime);
          this.foodForm.controls['endTime'].setValue(values.endTime);
          this.foodForm.controls['taxationEnable'].setValue(values.taxationEnable);
          this.foodForm.controls['stockType'].setValue(values.stockType);
          if (values.stockType == 'unlimited') {
            this.foodForm.controls['stockNumber'].setValue('-1');
            this.foodForm.controls['stockNumber'].disable();
          } else {
            this.foodForm.controls['stockNumber'].setValue(values.stockNumber);
            this.foodForm.controls['stockNumber'].enable();
          }

          if (values.taxationEnable == true) {
            console.log('Taxation Enabled--->>');
            this.foodForm.controls['foodTax'].setValidators(Validators.required);
            this.foodForm.controls['foodTax'].enable();
          } else {
            this.foodForm.controls['foodTax'].clearValidators();
            this.foodForm.controls['foodTax'].disable();
          }

          if (values.ownCategory == true) {
            this.foodForm.controls['category'].clearValidators();
            this.foodForm.controls['customCategory'].setValidators([Validators.required]);
            this.foodForm.controls['category'].setValue('');
            this.foodForm.controls['subCategory'].setValue('');
            this.vendorCategoryCtrl.patchValue(values.customCategory);
            this.foodForm.controls['customCategory'].patchValue(values.customCategory);
            this.foodForm.controls['customCategory'].updateValueAndValidity();
            this.tempVendorSubCategoryId = values.customSubCategory;
            this.getCustomSubCategoryById(values.customCategory, false);
          } else if (values.ownCategory == false) {
            this.foodForm.controls['category'].setValidators([Validators.required]);
            this.foodForm.controls['customCategory'].clearValidators();
            this.foodForm.controls['customCategory'].setValue('');
            this.foodForm.controls['customSubCategory'].setValue('');
            this.mainCategoryCtrl.patchValue(values.category);
            this.foodForm.controls['category'].patchValue(values.category);
            this.foodForm.controls['category'].updateValueAndValidity();
            this.tempMainSubCategoryId = values.subCategory;
            this.getSubCategoryById(values.category, false);
          }

          if (values && values.translations && values.translations instanceof Array) {
            this.translations = values.translations;
            this.locale();
          }

          if (values && values.variations && values.variations instanceof Array) {
            console.log('yes have variations');
            const stockType = response.foodInfo.stockType;
            console.log('Stock Type ------->>');
            console.log(stockType);
            console.log('Stock Type ------->>');
            const variations = values.variations;
            const variant = this.foodForm.get('variations') as FormArray;
            variations.forEach((element: any) => {
              const savedOption = new FormArray<FormGroup>([]);
              if (element && element.options && element.options instanceof Array) {
                element.options.forEach((option: any) => {
                  savedOption.push(this.fb.group({ name: [option.name, Validators.required], price: [option.price, Validators.required], stock: [{ value: option.stock, disabled: stockType == 'unlimited' ? true : false }, Validators.required] }))
                });
              }
              variant.push(this.fb.group({
                isRequired: new FormControl(element.isRequired == 'true' || element.isRequired == true ? true : false),
                title: new FormControl(element.title, Validators.required),
                type: new FormControl(element.type),
                min: element.type == 'single' ? new FormControl({ value: element.min, disabled: true }) : new FormControl(element.min, Validators.required),
                max: element.type == 'single' ? new FormControl({ value: element.max, disabled: true }) : new FormControl(element.max, Validators.required),
                options: savedOption
              }));
              console.log(element.options);
            });
            console.log(this.foodForm);
          }

          this.tagList = values.tags;
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterAddons(value: string): CityzenAddonsListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfAddons.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterFoodTaxation(value: string): CityzenFoodTaxationInfoInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfTaxation.filter((element) =>
      element.taxName.toLowerCase().includes(filterValue)
    );
  }


  private _filterCustomCategory(value: string): CityzenVendorCustomCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVendorCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterMainCategory(value: string): CityzenMainCategoryListForFoodsInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfMainCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
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

  getCustomSubCategoryById(id: string, isNew: boolean) {
    console.log(id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/vendor_sub_categories_list/' + id + '/' + this.foodForm.controls['restaurant'].value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          const mappedList = response.map(
            (item: CityzenVendorCustomSubCategoryListForFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfVendorSubCategory = mappedList;
          this.vendorSubCategoryList = this.vendorSubCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCustomSubCategory(element) : this.listOfVendorSubCategory.slice()))
          );
          if (this.action == 'edit' && isNew == false) {
            this.vendorSubCategoryCtrl.setValue(this.tempVendorSubCategoryId);
            this.foodForm.controls['customSubCategory'].patchValue(this.tempVendorSubCategoryId);
            this.foodForm.controls['customSubCategory'].updateValueAndValidity();
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterCustomSubCategory(value: string): CityzenVendorCustomSubCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVendorSubCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  getSubCategoryById(id: string, isNew: boolean) {
    console.log(id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/sub_cateories_list/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          const mappedList = response.map(
            (item: CityzenSubCategoryListForFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfMainSubCategory = mappedList;
          this.mainSubCategoryList = this.mainSubCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterMainSubCategory(element) : this.listOfMainSubCategory.slice()))
          );
          if (this.action == 'edit' && isNew == false) {
            this.mainSubCategoryCtrl.setValue(this.tempMainSubCategoryId);
            this.foodForm.controls['subCategory'].patchValue(this.tempMainSubCategoryId);
            this.foodForm.controls['subCategory'].updateValueAndValidity();
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  private _filterMainSubCategory(value: string): CityzenSubCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfMainSubCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    const locale = this.foodForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title], shortDescription: [element.shortDescription] }));
    });
    console.log(this.foodForm);
    console.log(this.foodForm.getRawValue());
    if (this.foodForm.valid) {
      console.log('on submit');
      if (this.action == 'add') {
        this.saveFood();
      } else {
        this.updateFood();
      }
    }
  }

  saveFood() {
    console.log('on save');
    console.log(this.foodForm);
    console.log(this.foodForm.value);
    const sendData = this.foodForm.getRawValue();
    const addonsId: any[] = [];
    this.listOfAddons.forEach((element) => {
      if (sendData.addons && sendData.addons.includes(element.name)) {
        addonsId.push(element.id);
      }
    });
    sendData.addons = addonsId.join();

    const foodTaxId: any[] = [];
    this.listOfTaxation.forEach((element) => {
      if (sendData.foodTax.includes(element.taxName)) {
        foodTaxId.push(element.id);
      }
    });
    sendData.foodTax = foodTaxId.join();
    sendData.tags = this.tagList;
    console.log('param', sendData);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/cityzen/create_food', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_added');
        this.router.navigate(['cityzen-team/food-list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  updateFood() {
    console.log('on update');
    console.log(this.foodForm);
    console.log(this.foodForm.value);
    const sendData = this.foodForm.getRawValue();
    const addonsId: any[] = [];
    this.listOfAddons.forEach((element) => {
      if (sendData.addons && sendData.addons.includes(element.name)) {
        addonsId.push(element.id);
      }
    });
    sendData.addons = addonsId.join();

    const foodTaxId: any[] = [];
    this.listOfTaxation.forEach((element) => {
      if (sendData.foodTax.includes(element.taxName)) {
        foodTaxId.push(element.id);
      }
    });
    sendData.foodTax = foodTaxId.join();
    sendData.tags = this.tagList;
    console.log('param', sendData);
    const spinnerRef = this.util.start('ts_updating');
    this.api.patch_private('v1/cityzen/update_food_detail/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_updated');
        this.router.navigate(['cityzen-team/food-list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.foodForm.patchValue({
      name: '',
      shortDescription: '',
      restaurant: '',
      image: '',
      ownCategory: false,
      category: '',
      subCategory: '',
      customCategory: '',
      customSubCategory: '',
      foodType: 'none',
      addons: '',
      startTime: '',
      endTime: '',
      price: '',
      discountType: '%',
      discount: '',
      purchaseLimit: '',
      taxationEnable: false,
      foodTax: null,
      status: 'live',
      stockType: 'unlimited',
      stockNumber: '-1'
    });

    (this.foodForm.get('translations') as FormArray).clear();
    (this.foodForm.get('variations') as FormArray).clear();
    (this.foodForm.get('tags') as FormArray).clear();

    this.tagList = [];
    this.addonList = [];
    this.haveSubmitClicked = false;

    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;

    console.log(this.foodForm.getRawValue());
  }

  get f() {
    return this.foodForm.controls;
  }

  onImageClick() {
    const dialogRef = this.dialog.open(CityzenMediaImagesDialog, {
      data: { value: this.foodForm.controls['image'].value },
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
        this.foodForm.controls['image'].setValue(result.data);
      }
    });
  }

  onStockChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'unlimited') {
      this.foodForm.controls['stockNumber'].setValue('-1');
      this.foodForm.controls['stockNumber'].clearValidators();
      this.foodForm.controls['stockNumber'].disable();
      const variations = this.foodForm.get('variations') as FormArray;
      variations.controls.forEach((element) => {
        const options = element.get('options') as FormArray;
        options.controls.forEach((options) => {
          const stock = options.get('stock') as FormControl;
          stock.disable();
          stock.patchValue('-1');
          stock.clearValidators();
          stock.updateValueAndValidity();
        });
      });
    } else {
      this.foodForm.controls['stockNumber'].setValue('');
      this.foodForm.controls['stockNumber'].setValidators(Validators.required);
      this.foodForm.controls['stockNumber'].enable();
      const variations = this.foodForm.get('variations') as FormArray;
      variations.controls.forEach((element) => {
        const options = element.get('options') as FormArray;
        options.controls.forEach((options) => {
          const stock = options.get('stock') as FormControl;
          stock.enable();
          stock.patchValue('');
          stock.setValidators(Validators.required);
          stock.updateValueAndValidity();
        });
      });
    }
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tagList.push(value);
    }
    event.chipInput!.clear();
    this.tagList = [... new Set(this.tagList)];
  }

  removeTag(tag: any): void {
    this.tagList = this.tagList.filter(x => x != tag);
  }

  editTag(tag: any, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.removeTag(tag);
      return;
    }
    const index = this.tagList.indexOf(tag);
    if (index >= 0) {
      this.tagList[index] = value;
    }
    this.tagList = [... new Set(this.tagList)];
  }

  openedChange(e: any) {
    this.addonsCtrl.patchValue('');
  }

  addAddon(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.addonList.push(value);
    }
    event.chipInput!.clear();
    this.addonList = [... new Set(this.addonList)];
  }

  removeAddont(addon: string): void {
    this.addonList = this.addonList.filter(x => x != addon);
  }

  addonSelected(event: MatAutocompleteSelectedEvent): void {
    this.addonList.push(event.option.viewValue);
    this.addonInput.nativeElement.value = '';
    this.addonsCtrl.setValue(null);
    this.addonList = [... new Set(this.addonList)];
  }

  addOptionInVariation(index: number) {
    console.log(index);
    const stockType = this.foodForm.controls['stockType'].value;
    const variations = this.foodForm.get('variations') as FormArray;
    const options = variations.controls[index].get('options') as FormArray;
    options.push(this.fb.group({ name: ['', Validators.required], price: ['', Validators.required], stock: [{ value: stockType == 'unlimited' ? '-1' : '', disabled: stockType == 'unlimited' ? true : false }, Validators.required] }))
    options.updateValueAndValidity();
  }

  removeVariation(index: number) {
    console.log(index);
    this.foodForm.controls['variations'].removeAt(index);
  }

  onVariationTypeChange(event: MatRadioChange, index: number) {
    console.log(event, index);
    const variations = this.foodForm.get('variations') as FormArray;
    const minControl = variations.controls[index].get('min') as FormGroup;
    const maxControl = variations.controls[index].get('max') as FormGroup;
    console.log(minControl);
    console.log(maxControl);
    if (event && event.value == 'single') {
      minControl.clearValidators();
      maxControl.clearValidators();
      minControl.disable();
      maxControl.disable();
      minControl.updateValueAndValidity();
      maxControl.updateValueAndValidity();
    } else {
      minControl.setValidators(Validators.required);
      maxControl.setValidators(Validators.required);
      minControl.enable();
      maxControl.enable();
      minControl.updateValueAndValidity();
      maxControl.updateValueAndValidity();
    }
  }

  onAddVariation() {
    const variant = this.foodForm.get('variations') as FormArray;
    variant.push(this.fb.group({
      isRequired: new FormControl(false),
      title: new FormControl('', Validators.required),
      type: new FormControl('multi'),
      min: new FormControl('', Validators.required),
      max: new FormControl('', Validators.required),
      options: new FormArray([this.fb.group({ name: new FormControl('', Validators.required), price: new FormControl('', Validators.required), stock: new FormControl('', Validators.required) }),])
    }));
    const newVariantIndex = variant.length - 1;
    const newVariant = variant.at(newVariantIndex) as FormGroup;
    const optionsArray = newVariant.get('options') as FormArray;
    const firstOption = optionsArray.at(0) as FormGroup;
    const stockControl = firstOption.get('stock');
    const stockType = this.foodForm.controls['stockType'].value;
    if (stockControl) {
      if (stockType == 'unlimited') {
        stockControl.setValue('-1');
        stockControl.disable();
      } else {
        stockControl.setValue('');
        stockControl.enable();
      }
      stockControl.updateValueAndValidity();
    }
  }

  getOptionsControl(index: number) {
    const variations = this.foodForm.get('variations') as FormArray;

    const variation = variations.at(index);
    if (!variation) return [];

    const options = variation.get('options') as FormArray | null;
    if (!options) return [];

    return options.controls;
  }

  deleteOptionFromVariations(index: number, jIndex: number) {
    console.log(index, jIndex);
    const variations = this.foodForm.get('variations') as FormArray;
    const options = variations.controls[index].get('options') as FormArray;
    options.removeAt(jIndex);
    options.updateValueAndValidity();
  }

  onOwnCategoryChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.foodForm.controls['category'].clearValidators();
      this.foodForm.controls['customCategory'].setValidators([Validators.required]);
      this.foodForm.controls['category'].setValue('');
      this.foodForm.controls['subCategory'].setValue('');
      this.mainCategoryCtrl.setValue('');
      this.mainSubCategoryCtrl.setValue('');
    } else if (event && event.value == false) {
      this.foodForm.controls['category'].setValidators([Validators.required]);
      this.foodForm.controls['customCategory'].clearValidators();
      this.foodForm.controls['customCategory'].setValue('');
      this.foodForm.controls['customSubCategory'].setValue('');
      this.vendorCategoryCtrl.setValue('');
    }
  }

  onCustomCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.foodForm.controls['customCategory'].setValue(event.option.value);
      this.foodForm.controls['customSubCategory'].setValue('');
      this.vendorSubCategoryCtrl.setValue('');
      this.getCustomSubCategoryById(event.option.value, true);
    }
  }

  onCustomSubCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.foodForm.controls['customSubCategory'].setValue(event.option.value);
    }
  }

  onMainCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.foodForm.controls['category'].setValue(event.option.value);
      this.foodForm.controls['subCategory'].setValue('');
      this.mainSubCategoryCtrl.setValue('');
      this.getSubCategoryById(event.option.value, true);
    }
  }

  onMainSubCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.foodForm.controls['subCategory'].setValue(event.option.value);
    }
  }

  getRestaurants() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/restaurant_cityzen/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurants) {
          this.listOfRestaurants = response.restaurants;
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

  private _filterRestaurant(value: any): CityzenRestaurantListLimitedInfoInterface[] {
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

  onRestaurantSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      console.log(this.restaurantCtrl);
      this.foodForm.controls['restaurant'].setValue(event.option.value);
      const selectedRestaurant = this.listOfRestaurants.find((x) => x.id == event.option.value);
      if (selectedRestaurant && selectedRestaurant.id) {
        if (selectedRestaurant && selectedRestaurant.customCategory != null && selectedRestaurant.customCategory == true) {
          console.log('Yes Have Custom categories');
          this.haveCustomCatetgoryFeature = true;
        } else {
          console.log('No Don not have custom categories');
          this.haveCustomCatetgoryFeature = false;
        }
      }
      this.getBasicData();
    }
  }

  getBasicData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/cityzen/food_get_basic_data/' + this.foodForm.controls['restaurant'].value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.addons) {
          this.listOfAddons = response.addons;
          this.addonsList = this.addonsCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterAddons(element) : this.listOfAddons.slice()))
          );
        }

        if (response && response.taxation && response.taxation.length) {
          this.listOfTaxation = response.taxation;
          this.taxationList = this.taxationCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoodTaxation(element) : this.listOfTaxation.slice()))
          );
        }


        if (response && response.category) {
          const mappedList = response.category.map(
            (item: CityzenMainCategoryListForFoodsInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfMainCategory = mappedList;
          this.mainCategoryList = this.mainCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterMainCategory(element) : this.listOfMainCategory.slice()))
          );
        }

        if (response && response.vendorCategory) {
          const mappedList = response.vendorCategory.map(
            (item: CityzenVendorCustomCategoryListForFoodInterface) => {
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.value || item.name;
              } else {
                item.displayName = item?.name || '';
              }
              return item;
            }
          );
          this.listOfVendorCategory = mappedList;
          this.vendorCategoryList = this.vendorCategoryCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterCustomCategory(element) : this.listOfVendorCategory.slice()))
          );
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onTaxationChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == true) {
      this.foodForm.controls['foodTax'].setValidators(Validators.required);
      this.foodForm.controls['foodTax'].enable();
    } else {
      this.foodForm.controls['foodTax'].clearValidators();
      this.foodForm.controls['foodTax'].disable();
      this.foodForm.controls['foodTax'].patchValue('');
      this.taxationCtrl.patchValue('');
    }
  }

  getTranslatedAddon(hash: CityzenAddonsListForFoodInterface): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }

  getTranslatedTaxation(hash: CityzenFoodTaxationInfoInterface): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.title || hash.displayName || hash.taxName;
  }

  getTranslatedMainCategoryName(item: CityzenMainCategoryListForFoodsInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayMainCategoryName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfMainCategory.find(item => item.id == id);
    return selected ? this.getTranslatedMainCategoryName(selected) : '';
  };

  getTranslatedMainSubCategoryName(item: CityzenSubCategoryListForFoodInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayMainSubCategoryName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfMainSubCategory.find(item => item.id == id);
    return selected ? this.getTranslatedMainSubCategoryName(selected) : '';
  };

  getTranslatedCustomCategoryName(item: CityzenVendorCustomCategoryListForFoodInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCustomCategoryName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfVendorCategory.find(item => item.id == id);
    return selected ? this.getTranslatedCustomCategoryName(selected) : '';
  };

  getTranslatedCustomSubCategoryName(item: CityzenVendorCustomSubCategoryListForFoodInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find(t => t.code == this.util.appLocaleName());
      if (found && found.value) {
        return found.value;
      }
    }
    return item.name;
  }

  displayCustomSubCategoryName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfVendorSubCategory.find(item => item.id == id);
    return selected ? this.getTranslatedCustomSubCategoryName(selected) : '';
  };

  get variationFormFields(): FormArray<FormGroup> {
    return this.foodForm.controls.variations as FormArray<FormGroup>;
  }
}
