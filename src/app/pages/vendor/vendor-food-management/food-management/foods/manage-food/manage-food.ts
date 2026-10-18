import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatSelectChange } from '@angular/material/select';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorAddonListForFoodInterface } from 'src/app/interfaces/vendor.addons.list.for.food.interface';
import { VendorMainCategoryListForFoodInterface } from 'src/app/interfaces/vendor.main.category.list.for.food.interface';
import { VendorCustomCategoryListForFoodInterface } from 'src/app/interfaces/vendor.custom.category.list.for.food.interface';
import { VendorMainSubCategoryListForFoodInterface } from 'src/app/interfaces/vendor.main.sub.category.list.for.food.interface';
import { VendorCustomSubCategoryListForFoodInterface } from 'src/app/interfaces/vendor.custom.sub.category.list.for.food.interface';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { VendorFoodTaxationListInterface } from 'src/app/interfaces/vendor.food.taxation.list.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-manage-food',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './manage-food.html',
})
export class ManageFood {

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
    taxationEnable: new FormControl(false),
    foodTax: new FormControl(),
    tags: new FormArray<FormControl<string>>([]),
    stockType: new FormControl('unlimited', [Validators.required]),
    stockNumber: new FormControl('-1', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  addonsList: Observable<VendorAddonListForFoodInterface[]>;
  listOfAddons: VendorAddonListForFoodInterface[] = [];
  addonsCtrl = new FormControl('');
  taxationList: Observable<VendorFoodTaxationListInterface[]>;
  listOfTaxation: VendorFoodTaxationListInterface[] = [];
  taxationCtrl = new FormControl('');
  vendorCategoryList: Observable<VendorCustomCategoryListForFoodInterface[]>;
  listOfVendorCategory: VendorCustomCategoryListForFoodInterface[] = [];
  vendorCategoryCtrl = new FormControl('');
  vendorSubCategoryList: Observable<VendorCustomSubCategoryListForFoodInterface[]>;
  listOfVendorSubCategory: VendorCustomSubCategoryListForFoodInterface[] = [];
  vendorSubCategoryCtrl = new FormControl('');
  tempVendorSubCategoryId: string = '';
  mainCategoryList: Observable<VendorMainCategoryListForFoodInterface[]>;
  listOfMainCategory: VendorMainCategoryListForFoodInterface[] = [];
  mainCategoryCtrl = new FormControl('');
  mainSubCategoryList: Observable<VendorMainSubCategoryListForFoodInterface[]>;
  listOfMainSubCategory: VendorMainSubCategoryListForFoodInterface[] = [];
  mainSubCategoryCtrl = new FormControl('');
  tempMainSubCategoryId: string = '';
  haveCustomCatetgoryFeature: boolean = false;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tagList: any[] = [];
  addonList: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.foodForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    const _vendorCustomCategory = this.util.getItem('_vendorCustomCategory');
    if (_vendorCustomCategory == 'true') {
      this.haveCustomCatetgoryFeature = true;
    }
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id && this.action == 'edit') {
      this.getInfo();
    } else {
      this.getBasicData();
      this.foodForm.controls['foodTax'].clearValidators();
      this.foodForm.controls['foodTax'].disable();
      this.foodForm.controls['foodTax'].patchValue('');
      this.foodForm.controls['stockNumber'].clearValidators();
      this.foodForm.controls['stockNumber'].disable();
      this.foodForm.controls['stockNumber'].patchValue('-1');
      this.locale();
    }
  }

  getInfo() {
    console.log('get info');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/foods/getFoodInfo/' + this.id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.addons && response.addons.length) {
          this.listOfAddons = response.addons;
          this.addonsList = this.addonsCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterAddons(element) : this.listOfAddons.slice()))
          );

          this.listOfTaxation = response.taxations;
          this.taxationList = this.taxationCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this._filterFoodTaxation(element) : this.listOfTaxation.slice()))
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
        }

        if (response && response.category && response.category.length) {
          const mappedList = response.category.map(
            (item: VendorMainCategoryListForFoodInterface) => {
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
            (item: VendorCustomCategoryListForFoodInterface) => {
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
          if (values.taxationEnable == true) {
            console.log('Taxation Enabled--->>');
            this.foodForm.controls['foodTax'].setValidators(Validators.required);
            this.foodForm.controls['foodTax'].enable();
          } else {
            this.foodForm.controls['foodTax'].clearValidators();
            this.foodForm.controls['foodTax'].disable();
          }
          this.foodForm.controls['stockType'].setValue(values.stockType);
          if (values.stockType == 'unlimited') {
            this.foodForm.controls['stockNumber'].setValue('-1');
            this.foodForm.controls['stockNumber'].disable();
          } else {
            this.foodForm.controls['stockNumber'].setValue(values.stockNumber);
            this.foodForm.controls['stockNumber'].enable();
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  getBasicData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/foods/getBasicData/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.addons && response.addons.length) {
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


        if (response && response.category && response.category.length) {
          const mappedList = response.category.map(
            (item: VendorMainCategoryListForFoodInterface) => {
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
            (item: VendorCustomCategoryListForFoodInterface) => {
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterAddons(value: string): VendorAddonListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfAddons.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterFoodTaxation(value: string): VendorFoodTaxationListInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfTaxation.filter((element) =>
      element.taxName.toLowerCase().includes(filterValue)
    );
  }

  private _filterCustomCategory(value: string): VendorCustomCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVendorCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
  }

  private _filterMainCategory(value: string): VendorMainCategoryListForFoodInterface[] {
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
    this.api.post_private('v1/vendor_web/foods/save', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_added');
        this.router.navigate(['vendor/food-management/food-list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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
    this.api.patch_private('v1/vendor_web/foods/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_food_updated');
        this.router.navigate(['vendor/food-management/food-list']);
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onReset() {
    console.log('reset');
    (this.foodForm.get('translations') as FormArray).clear();
    (this.foodForm.get('variations') as FormArray).clear();
    (this.foodForm.get('tags') as FormArray).clear();
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
      stockType: 'unlimited',
      stockNumber: '-1'
    });
    this.tagList = [];
    const localeMapped = this.languages.map((item) => {
      item.title = '';
      item.shortDescription = '';
      return item;
    });
    this.languages = localeMapped;
    this.haveSubmitClicked = false;
    console.log(this.foodForm.getRawValue());
  }

  get f() {
    return this.foodForm.controls;
  }

  onImageClick() {
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
        this.foodForm.controls['image'].setValue(result.data);
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

  getCustomSubCategoryById(id: string, isNew: boolean) {
    console.log(id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/vendor_sub_category/getActiveByCategoryId/' + id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          const mappedList = response.map(
            (item: VendorCustomSubCategoryListForFoodInterface) => {
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterCustomSubCategory(value: string): VendorCustomSubCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfVendorSubCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
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

  onCustomSubCategorySelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      this.foodForm.controls['customSubCategory'].setValue(event.option.value);
    }
  }

  getSubCategoryById(id: string, isNew: boolean) {
    console.log(id);
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/sub_category/getByCategoryId/' + id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response) {
          const mappedList = response.map(
            (item: VendorMainSubCategoryListForFoodInterface) => {
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
        this.util.handleError(error, 'vendor');
      }
    });
  }

  private _filterMainSubCategory(value: string): VendorMainSubCategoryListForFoodInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfMainSubCategory.filter((element) =>
      element.displayName.toLowerCase().includes(filterValue)
    );
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

  getTranslatedAddon(hash: VendorAddonListForFoodInterface): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.value || hash.displayName || hash.name;
  }


  getTranslatedTax(hash: VendorFoodTaxationListInterface): string {
    const found = hash.translations?.find(t => t.code == this.util.appLocaleName());
    return found?.title || hash.displayName || hash.taxName;
  }

  getTranslatedCustomCategoryName(item: VendorCustomCategoryListForFoodInterface): string {
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

  getTranslatedCustomSubCategoryName(item: VendorCustomSubCategoryListForFoodInterface): string {
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

  getTranslatedMainCategoryName(item: VendorMainCategoryListForFoodInterface): string {
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


  getTranslatedMainSubCategoryName(item: VendorMainSubCategoryListForFoodInterface): string {
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

  get variationFormFields(): FormArray<FormGroup> {
    return this.foodForm.controls.variations as FormArray<FormGroup>;
  }
}
