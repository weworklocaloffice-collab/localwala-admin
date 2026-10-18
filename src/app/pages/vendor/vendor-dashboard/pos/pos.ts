import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PosFoodInfoInterface } from 'src/app/interfaces/pos.food.info.interface';
import { VendorPosCategoryListInterface } from 'src/app/interfaces/vendor.pos.category.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { PosFoodInfoDialog } from './pos-food-info-dialog/pos-food-info-dialog';
import { Observable, map, startWith } from 'rxjs';
import { PosCartItemInterface } from 'src/app/interfaces/pos.cart.item.interface';
import { MatSelectChange } from '@angular/material/select';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-pos',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './pos.html',
})
export class Pos {

  categoryIndex: number = 0;
  foodKind: string = '';
  categoryId: string = '';
  categories: VendorPosCategoryListInterface[] = [];
  products: PosFoodInfoInterface[] = [];
  additionalServiceAmount: number = 0;
  additionalServiceCharge: boolean = false;
  additionalServiceName: string = '';
  foodTaxAmount: number = 0;
  foodTaxName: string = '';
  foodTaxType: string = '';
  includeTaxOnFood: boolean = false;
  havePackagingCharges: boolean = false;
  includePackagesChargesInTax: boolean = false;
  packagingCharges: number = 0;
  packagingChargesTax: number = 0;
  foodFetch: boolean = false;
  posItems: PosCartItemInterface[] = [];
  cartItemColumn: string[] = ['name', 'quantity', 'totalPrice', 'id'];
  realTotal: number = 0;
  itemTotal: number = 0;
  itemDiscount: number = 0;
  serviceCharge: number = 0;
  foodServiceCharge: number = 0;
  discountAmount: number = 0;
  usedDiscountPrice: number = 0;
  discountType: string = 'per';
  grandTotal: number = 0;
  paymentMode: string = 'online';
  customerType: string = 'guest';
  customerForm = new FormGroup({
    customerName: new FormControl('none', [Validators.required]),
    customerCountryCode: new FormControl('', [Validators.required]),
    customerContact: new FormControl('none', [Validators.required]),
  });
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.customerForm.controls['customerCountryCode'].setValue(this.api.defaultCountryCode);
    this.getCountryCodes();
    console.log(this.customerForm);
    this.getInitialData();
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

  getInitialData() {
    console.log('Get Initial Data');
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/restaurant/posDataWeb/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.categories = [];
        const allCategoryObject = {
          name: this.util.appTranslate('dd_all'),
          kind: 'all',
          id: 'all',
        };
        this.categories.push(allCategoryObject);
        if (response && response.success == true) {
          const categories = response.categories;
          if (categories && categories.category && Array.isArray(categories.category) && categories.category.length > 0) {
            const cateList = categories.category.map((item: any) => {
              if (item.category_translations) {
                const mainTranslation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                item.category_name = mainTranslation?.value || item.name;
              }
              return item;
            });
            cateList.forEach((element: any) => {
              const categoryObject = {
                name: element.category_name,
                kind: 'main',
                id: element.category_id,
              };
              this.categories.push(categoryObject);
            });
          }
          if (categories && categories.own && Array.isArray(categories.own) && categories.own.length > 0) {
            const cateList = categories.own.map((item: any) => {
              if (item.category_translations) {
                const mainTranslation = item.category_translations.find((t: any) => t.code == this.util.appLocaleName());
                item.category_name = mainTranslation?.value || item.name;
              }
              return item;
            });
            cateList.forEach((element: any) => {
              const categoryObject = {
                name: element.category_name,
                kind: 'custom',
                id: element.category_id,
              };
              this.categories.push(categoryObject);
            });
          }

          if (response && response.business && response.business.id) {
            const business = response.business;
            this.additionalServiceAmount = business.additionalServiceAmount;
            this.additionalServiceCharge = business.additionalServiceCharge;
            this.additionalServiceName = business.additionalServiceName;
            this.foodTaxAmount = business.foodTaxAmount;
            this.foodTaxName = business.foodTaxName;
            this.foodTaxType = business.foodTaxType;
            this.includeTaxOnFood = business.includeTaxOnFood;

            if (business.additionalServiceCharge == true) {
              this.serviceCharge = business.additionalServiceAmount;
            }
          }

          if (response && response.packaging && response.packaging.id) {
            const packaging = response.packaging;
            this.havePackagingCharges = packaging.havePackagingCharges;
            this.includePackagesChargesInTax = packaging.includePackagesChargesInTax;
            if (this.havePackagingCharges == true) {
              this.packagingCharges = packaging.packagingCharges;
            }
            if (this.havePackagingCharges == true) {
              if (this.includePackagesChargesInTax == true) {
                function percentage(numFirst: number, per: number) {
                  return (numFirst / 100) * per;
                }
                const total = (parseFloat(percentage(packaging.packagingCharges, packaging.packagingChargesTax).toString())).toFixed(2);
                this.packagingChargesTax = parseFloat(total);
              }
            }
          }
          this.grandTotal = this.calculateGrandTotal();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  translateFoodList() {
    const mappedList = this.products.map(
      (item: PosFoodInfoInterface) => {
        if (item.translations) {
          const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
          item.displayName = translation?.title || item.name;
          item.displayShortDescription = translation?.shortDescription || item.shortDescription;
        } else {
          item.displayName = item?.name || '';
          item.displayShortDescription = item?.shortDescription || '';
        }
        return item;
      }
    );
    this.products = mappedList;
  }

  searchProducts(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue);
    if (filterValue.length >= 3) {
      this.foodFetch = false;
      this.products = [];
      this.api.get_private('v1/vendor_web/restaurant/posFoodSearch/' + this.util.getItem('_vendorId') + '/' + filterValue).subscribe({
        next: (response: any) => {
          console.log(response);
          this.foodFetch = true;
          if (response && response.success && response.foods && response.foods.length) {
            response.foods.forEach((element: any) => {
              let price = parseFloat(parseFloat(element.price).toFixed(2));
              let offerPrice = 0;
              if (element && element.taxationEnable && element.taxationEnable == true) {
                let taxPercentage: number = 0;
                if (element && element.foodtaxations && element.foodtaxations.length) {
                  element.foodtaxations.forEach((taxation: any) => {
                    taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
                  });
                }
                if (taxPercentage > 0) {
                  const basePrice = price;
                  price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
                }
              }
              if (element && element.discount && parseFloat(element.discount) > 0) {
                element.discount = parseFloat(parseFloat(element.discount).toFixed(2));
                if (element.discountType == '%') {
                  const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(element.discount.toString()) / 100)).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                } else {
                  const discountValue = (parseFloat(price.toString()) - parseFloat(element.discount.toString())).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                }
              } else {
                element.discount = 0;
              }
              if (element && element.purchaseLimit != '' && element.purchaseLimit != null) {
                if (element && element.purchaseLimit.toString() != '-1') {
                  element.purchaseLimit = parseInt(element.purchaseLimit);
                } else {
                  element.purchaseLimit = 1000000000000000;
                }
              } else {
                element.purchaseLimit = 5;
              }

              if (element && element.stockNumber != null && element.stockNumber != '') {
                element.stockNumber = parseInt(element.stockNumber);
              } else {
                element.stockNumber = -1;
              }

              const addons: any[] = [];
              if (element && element.addons && element.addons.length > 0) {
                element.addons.forEach((addonElement: any) => {
                  let stockNumber = 5;
                  if (addonElement && addonElement.stockNumber != null && addonElement.stockNumber != '') {
                    if (addonElement.stockNumber.toString() == '-1') {
                      stockNumber = 1000000000000000;
                    } else {
                      stockNumber = parseInt(addonElement.stockNumber);
                    }
                  }
                  const addonParam = {
                    name: addonElement.name,
                    translations: addonElement.translations,
                    id: addonElement.id,
                    price: parseFloat(addonElement.price),
                    inStock: addonElement.inStock,
                    stockNumber: stockNumber,
                    stockType: addonElement && addonElement.stockType && addonElement.stockType != null && addonElement.stockType != '' ? addonElement.stockType : 'unlimited',
                  };
                  addons.push(addonParam);
                });
              }

              const taxations: any[] = [];
              if (element && element.foodtaxations && element.foodtaxations.length > 0) {
                element.foodtaxations.forEach((taxElement: any) => {
                  const taxParam = {
                    taxName: taxElement.taxName,
                    translations: taxElement.translations,
                    id: taxElement.id,
                    taxAmount: parseFloat(taxElement.taxAmount),
                  };
                  taxations.push(taxParam);
                });
              }

              const variations: any[] = [];
              if (element && element.variations && element.variations.length > 0) {
                element.variations.forEach((variationElement: any) => {
                  const isRequired = variationElement.isRequired == 'true' || variationElement.isRequired == true ? true : false;
                  let min = 1;
                  let max = 1;
                  if (variationElement && variationElement.min != null && variationElement.min != '') {
                    min = parseInt(variationElement.min);
                  } else {
                    min = 1;
                  }
                  if (variationElement && variationElement.max != null && variationElement.max != '') {
                    max = parseInt(variationElement.max);
                  } else {
                    max = 1;
                  }
                  if (variationElement.min == 0 || variationElement.min == '0') {
                    min = 1;
                  }
                  if (variationElement.max == 0 || variationElement.max == '0') {
                    max = 1;
                  }
                  const options: any[] = [];
                  if (variationElement && variationElement.options && variationElement.options.length > 0) {
                    variationElement.options.forEach((variationOption: any) => {
                      let priceOfOption = 0;
                      let stock = 5;
                      if (variationOption && variationOption.price != null && variationOption.price != '') {
                        priceOfOption = parseFloat(variationOption.price);
                      }
                      if (variationOption && variationOption.stock != null && variationOption.stock != '') {
                        if (variationOption.stock.toString() != '-1') {
                          stock = parseInt(variationOption.stock);
                        } else if (variationOption.stock.toString() == '-1') {
                          stock = 1000000000000000;
                        }
                      }
                      const optionParam = {
                        name: variationOption.name,
                        price: priceOfOption,
                        stock: stock,
                      }
                      options.push(optionParam);
                    });
                  }
                  const variationParam = {
                    isRequired: isRequired,
                    title: variationElement.title,
                    type: min == 1 && max == 1 ? 'single' : variationElement.type,
                    min: min,
                    max: max,
                    options: options
                  };
                  variations.push(variationParam);
                });
              }

              const foodParam: any = {
                name: element.name,
                shortDescription: element.shortDescription,
                image: element.image,
                foodType: element.foodType,
                addons: addons,
                startTime: element.startTime,
                endTime: element.endTime,
                price: price,
                discountType: element.discountType,
                discount: element.discount,
                offerPrice: offerPrice,
                variations: variations,
                translations: element.translations,
                purchaseLimit: element.purchaseLimit,
                quantity: 0,
                cartEntity: 'single',
                status: element.status,
                inStock: element.inStock,
                taxationEnable: element.taxationEnable,
                foodtaxations: taxations,
                id: element.id,
                stockNumber: element.stockNumber,
                stockType: element.stockType,
              };
              this.products.push(foodParam);
            });
          } else {
            this.products = [];
          }
          this.translateFoodList();
        }, error: (error: any) => {
          console.log(error);
          this.foodFetch = true;
          this.products = [];
          this.util.handleError(error, 'vendor');
        }
      });
    } else {
      this.getFoodList();
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent.index);
    this.categoryIndex = tabChangeEvent.index;
    console.log(this.categories[this.categoryIndex].id);
    if (this.categoryIndex == 0) {
      this.foodKind = 'all';
      this.categoryId = '';
    } else {
      this.foodKind = this.categories[this.categoryIndex].kind;
      this.categoryId = this.categories[this.categoryIndex].id;
    }
    this.getFoodList();
  }

  getFoodList() {
    this.foodFetch = false;
    const param = {
      vendor: this.util.getItem('_vendorId'),
      kind: this.foodKind,
      category: this.categoryId,
    }
    console.log(param);
    this.products = [];
    this.api.post_private('v1/vendor_web/restaurant/posFoodListWeb/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.foodFetch = true;
        if (response && response.success && response.products && response.products.length) {
          response.products.forEach((element: any) => {
            let price = parseFloat(parseFloat(element.price).toFixed(2));
            let offerPrice = 0;
            if (element && element.taxationEnable && element.taxationEnable == true) {
              let taxPercentage: number = 0;
              if (element && element.foodtaxations && element.foodtaxations.length) {
                element.foodtaxations.forEach((taxation: any) => {
                  taxPercentage = taxPercentage + parseFloat(parseFloat(taxation.taxAmount).toFixed(2));
                });
              }
              if (taxPercentage > 0) {
                const basePrice = price;
                price = parseFloat((basePrice + (taxPercentage / 100) * basePrice).toFixed(2));
              }
            }
            if (element && element.discount && parseFloat(element.discount) > 0) {
              element.discount = parseFloat(parseFloat(element.discount).toFixed(2));
              if (element.discountType == '%') {
                const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(element.discount.toString()) / 100)).toFixed(2);
                offerPrice = parseFloat(discountValue);
              } else {
                const discountValue = (parseFloat(price.toString()) - parseFloat(element.discount.toString())).toFixed(2);
                offerPrice = parseFloat(discountValue);
              }
            } else {
              element.discount = 0;
            }
            if (element && element.purchaseLimit != '' && element.purchaseLimit != null) {
              if (element && element.purchaseLimit.toString() != '-1') {
                element.purchaseLimit = parseInt(element.purchaseLimit);
              } else {
                element.purchaseLimit = 1000000000000000;
              }
            } else {
              element.purchaseLimit = 5;
            }

            if (element && element.stockNumber != null && element.stockNumber != '') {
              element.stockNumber = parseInt(element.stockNumber);
            } else {
              element.stockNumber = -1;
            }

            const addons: any[] = [];
            if (element && element.addons && element.addons.length > 0) {
              element.addons.forEach((addonElement: any) => {
                let stockNumber = 0;
                if (addonElement && addonElement.stockNumber != null && addonElement.stockNumber != '') {
                  if (addonElement.stockNumber.toString() == '-1') {
                    stockNumber = 1000000000000000;
                  } else {
                    stockNumber = parseInt(addonElement.stockNumber);
                  }
                } else {
                  stockNumber = 0;
                }
                const addonParam = {
                  name: addonElement.name,
                  translations: addonElement.translations,
                  id: addonElement.id,
                  price: parseFloat(addonElement.price),
                  inStock: addonElement.inStock,
                  stockNumber: stockNumber,
                  stockType: addonElement && addonElement.stockType && addonElement.stockType != null && addonElement.stockType != '' ? addonElement.stockType : 'unlimited',
                };
                addons.push(addonParam);
              });
            }

            const taxations: any[] = [];
            if (element && element.foodtaxations && element.foodtaxations.length > 0) {
              element.foodtaxations.forEach((taxElement: any) => {
                const taxParam = {
                  taxName: taxElement.taxName,
                  translations: taxElement.translations,
                  id: taxElement.id,
                  taxAmount: parseFloat(taxElement.taxAmount),
                };
                taxations.push(taxParam);
              });
            }

            const variations: any[] = [];
            if (element && element.variations && element.variations.length > 0) {
              element.variations.forEach((variationElement: any) => {
                const isRequired = variationElement.isRequired == 'true' || variationElement.isRequired == true ? true : false;
                let min = 1;
                let max = 1;
                if (variationElement && variationElement.min != null && variationElement.min != '') {
                  min = parseInt(variationElement.min);
                } else {
                  min = 1;
                }
                if (variationElement && variationElement.max != null && variationElement.max != '') {
                  max = parseInt(variationElement.max);
                } else {
                  max = 1;
                }
                if (variationElement.min == 0 || variationElement.min == '0') {
                  min = 1;
                }
                if (variationElement.max == 0 || variationElement.max == '0') {
                  max = 1;
                }
                const options: any[] = [];
                if (variationElement && variationElement.options && variationElement.options.length > 0) {
                  variationElement.options.forEach((variationOption: any) => {
                    let priceOfOption = 0;
                    let stock = 5;
                    if (variationOption && variationOption.price != null && variationOption.price != '') {
                      priceOfOption = parseFloat(variationOption.price);
                    }
                    if (variationOption && variationOption.stock != null && variationOption.stock != '') {
                      if (variationOption.stock.toString() != '-1') {
                        stock = parseInt(variationOption.stock);
                      } else if (variationOption.stock.toString() == '-1') {
                        stock = 1000000000000000;
                      }
                    }
                    const optionParam = {
                      name: variationOption.name,
                      price: priceOfOption,
                      stock: stock,
                    }
                    options.push(optionParam);
                  });
                }
                const variationParam = {
                  isRequired: isRequired,
                  title: variationElement.title,
                  type: min == 1 && max == 1 ? 'single' : variationElement.type,
                  min: min,
                  max: max,
                  options: options
                };
                variations.push(variationParam);
              });
            }

            const foodParam: any = {
              name: element.name,
              shortDescription: element.shortDescription,
              image: element.image,
              foodType: element.foodType,
              addons: addons,
              startTime: element.startTime,
              endTime: element.endTime,
              price: price,
              discountType: element.discountType,
              discount: element.discount,
              offerPrice: offerPrice,
              variations: variations,
              translations: element.translations,
              purchaseLimit: element.purchaseLimit,
              quantity: 0,
              cartEntity: 'single',
              status: element.status,
              inStock: element.inStock,
              taxationEnable: element.taxationEnable,
              foodtaxations: taxations,
              id: element.id,
              stockNumber: element.stockNumber,
              stockType: element.stockType,
            };
            this.products.push(foodParam);
          });
        } else {
          this.products = [];
        }
        this.translateFoodList();
      }, error: (error: any) => {
        console.log(error);
        this.foodFetch = true;
        this.products = [];
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onFoodInfo(item: PosFoodInfoInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(PosFoodInfoDialog, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { info: item },
      panelClass: 'pos-food-modal'
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.success && result.success == true) {
        const savedAddon: any[] = [];
        const newAddonIds: string[] = [];
        if (result && result.addons && result.addons.length > 0) {
          result.addons.forEach((element: any) => {
            const addonParam = {
              'name': element.name,
              'translations': element.translations,
              'id': element.id,
              'price': element.price,
              'inStock': element.inStock,
              'stockNumber': element.stockNumber,
              'stockType': element.stockType,
              'haveDiscount': element.haveDiscount,
              'discountPrice': element.discountPrice
            }
            savedAddon.push(addonParam);
            newAddonIds.push(element.id);
          });
        }
        const savedVariations: any[] = [];
        const newVariationIds: string[] = [];
        if (result && result.variations && result.variations.length > 0) {
          result.variations.forEach((element: any) => {
            const options: any[] = [];
            if (element && element.options && element.options.length > 0) {
              element.options.forEach((op: any) => {
                newVariationIds.push(`${element.title}-${op.name}`);
                const optionParam = {
                  'name': op.name,
                  'price': op.price,
                  'haveDiscount': op.haveDiscount,
                  'discountPrice': op.discountPrice,
                  'enable': op.enable,
                  'stock': op.stock,
                };
                options.push(optionParam);
              });
              const variationParam = {
                'isRequired': element.isRequired,
                'title': element.title,
                'type': element.type,
                'min': element.min,
                'max': element.max,
                'options': options,
              };
              savedVariations.push(variationParam);
            }
          });
        }
        newAddonIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        newVariationIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        let isSameProduct: string = 'false';
        let sameUuid: string = '';
        let isSameQuantity: number = 0;
        ////// Check Repeated List //////
        const repeatedList = this.posItems.filter((x) => x.id == item.id);
        if (repeatedList.length > 0) {
          const existingAddonIds: string[] = [];
          const existingVariationIds: string[] = [];
          repeatedList.forEach((element) => {
            element.addons.forEach((addn) => {
              existingAddonIds.push(addn.id);
            });
            element.variations.forEach((variant) => {
              variant.options.forEach((ops) => {
                existingVariationIds.push(`${variant.title}-${ops.name}`);
              });
            });
            existingAddonIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            existingVariationIds.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            if (newAddonIds.join('') == existingAddonIds.join('') && newVariationIds.join('') == existingVariationIds.join('')) {
              sameUuid = element.uuid;
              isSameQuantity = element.quantity;
              isSameProduct = 'true';
            }
          });
        }
        ////// Check Repeated List //////

        if (isSameProduct == 'true' && sameUuid != '') {
          const newQuantity = (isSameQuantity + parseInt(result.quantity));
          const quantity = parseInt(newQuantity.toString());
          if (quantity < item.purchaseLimit!) {
            let checkAddonHaveStock: string = 'true';
            let checkVariationHaveStock: string = 'true';
            let addonOutOfStockLimitNumber: number = 0;
            let variationOutOfStockLimitNumber: number = 0;
            savedAddon.forEach((addon) => {
              if (quantity >= addon.stockNumber) {
                checkAddonHaveStock = 'false';
                if (addonOutOfStockLimitNumber == 0) {
                  addonOutOfStockLimitNumber = addon.stockNumber;
                }
              }
            });
            savedVariations.forEach((variation: any) => {
              variation.options.forEach((options: any) => {
                if (quantity >= options.stock) {
                  checkVariationHaveStock = 'false';
                  if (variationOutOfStockLimitNumber == 0) {
                    variationOutOfStockLimitNumber = options.stock;
                  }
                }
              });
            });
            if (item.stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
              const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
              if (indexOfSameItem != -1) {
                this.posItems[indexOfSameItem].quantity = quantity;
                this.calculateItemTotal();
              }
            } else if (quantity < item.stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
              const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
              if (indexOfSameItem != -1) {
                this.posItems[indexOfSameItem].quantity = quantity;
                this.calculateItemTotal();
              }
            } else {
              if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
                this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
              } else {
                const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
                if (indexOfSameItem != -1) {
                  this.posItems[indexOfSameItem].quantity = item.stockNumber;
                  this.util.onError('ts_stock_limit_error', `${item.stockNumber}`);
                  this.calculateItemTotal();
                }
              }
            }
          } else {
            const indexOfSameItem = this.posItems.findIndex((x) => x.uuid == sameUuid && x.id == item.id);
            if (indexOfSameItem != -1) {
              this.posItems[indexOfSameItem].quantity = item.purchaseLimit;
              this.util.onError('ts_purchase_error', `${item.purchaseLimit}`);
              this.calculateItemTotal();
            }
          }
        } else {
          /////////////// Add To Cart //////////////////
          const addToCartParam = {
            'uuid': this.util.generateUUID(),
            'name': item.name,
            'image': item.image,
            'price': item.price,
            'discountType': item.discountType,
            'discount': item.discount,
            'offerPrice': item.offerPrice,
            'purchaseLimit': item.purchaseLimit,
            'stockNumber': item.stockNumber,
            'stockType': item.stockType,
            'quantity': result.quantity,
            'id': item.id,
            'addons': savedAddon,
            'variations': savedVariations,
            'translations': item.translations,
            'inStock': item.inStock,
            'taxationEnable': item.taxationEnable,
            'foodtaxations': item.foodtaxations,
            'optionName': '',
            'totalPrice': 0,
            'realPrice': 0,
            'itemDiscount': 0,
            'instruction': result.instruction,
            'displayName': ''
          }
          this.posItems.push(addToCartParam);
          this.posItems = [...this.posItems];
          this.calculateItemTotal();
          /////////////// Add To Cart //////////////////
        }
      }
    });
  }

  translateCartItem() {
    const mappedList = this.posItems.map(
      (item: PosCartItemInterface) => {
        const optionNameList: string[] = [];
        if (item.translations) {
          const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
          item.displayName = translation?.title || item.name;
        } else {
          item.displayName = item?.name || '';
        }
        item.addons?.map((addonItem) => {
          if (addonItem.translations) {
            const translation = addonItem.translations.find((t) => t.code == this.util.appLocaleName());
            addonItem.displayName = translation?.value || addonItem.name;
          } else {
            addonItem.displayName = addonItem?.name || '';
          }
          optionNameList.push(addonItem.displayName);
        });

        item.variations?.map((variationElement) => {
          variationElement?.options?.map((optionElement) => {
            optionNameList.push(optionElement.name);
          });
        });

        item.foodtaxations?.map((taxItem) => {
          if (taxItem.translations) {
            const translation = taxItem.translations.find((t) => t.code == this.util.appLocaleName());
            taxItem.displayName = translation?.title || taxItem.taxName;
          } else {
            taxItem.displayName = taxItem?.taxName || '';
          }
        });
        item.optionName = optionNameList.join(',');
        return item;
      }
    );
    this.posItems = mappedList;
  }

  calculateItemTotal() {
    this.posItems.forEach((item) => {
      let price: number = 0;
      let addonPrice: number = 0;
      let variationPrice: number = 0;
      // Real Price //
      let realPrice: number = 0.0;
      let addonRealPrice: number = 0.0;
      let variationRealPrice: number = 0.0;
      // Real Price //
      const optionNameList: string[] = [];
      item.variations.forEach((variant) => {
        variant.options.forEach((ops) => {
          optionNameList.push(ops.name);
        });
      });
      item.addons.forEach((addons) => {
        optionNameList.push(addons.name);
        // Real Price //
        const realPriceOfAddon = (parseFloat(addonRealPrice.toString()) + (parseFloat(addons.price.toString()))).toFixed(2);
        addonRealPrice = parseFloat(realPriceOfAddon);
        // Real Price //
        if (addons.haveDiscount) {
          const price = (parseFloat(addonPrice.toString()) + (parseFloat(addons.discountPrice.toString()))).toFixed(2);
          addonPrice = parseFloat(price);
        } else {
          const price = (parseFloat(addonPrice.toString()) + (parseFloat(addons.price.toString()))).toFixed(2);
          addonPrice = parseFloat(price);
        }
      });
      item.variations.forEach((variation) => {
        variation.options.forEach((options) => {
          // Real Price //
          const realPriceOfVariation = (parseFloat(variationRealPrice.toString()) + (parseFloat(options.price.toString()))).toFixed(2);
          variationRealPrice = parseFloat(realPriceOfVariation);
          // Real Price //
          if (options.haveDiscount) {
            const price = (parseFloat(variationPrice.toString()) + (parseFloat(options.discountPrice.toString()))).toFixed(2);
            variationPrice = parseFloat(price);
          } else {
            const price = (parseFloat(variationPrice.toString()) + (parseFloat(options.price.toString()))).toFixed(2);
            variationPrice = parseFloat(price);
          }
        });
      });

      // Real Price //
      const realTotalPrice = (parseFloat(item.price.toString()) + (parseFloat(addonRealPrice.toString())) + (parseFloat(variationRealPrice.toString()))).toFixed(2);
      realPrice = parseFloat(realTotalPrice);
      // Real Price //

      if (item.discount > 0) {
        const totalPrice = (parseFloat(item.offerPrice.toString()) + parseFloat(price.toString()) + (parseFloat(addonPrice.toString())) + (parseFloat(variationPrice.toString()))).toFixed(2);
        price = parseFloat(totalPrice);
      } else {
        const totalPrice = (parseFloat(item.price.toString()) + parseFloat(price.toString()) + (parseFloat(addonPrice.toString())) + (parseFloat(variationPrice.toString()))).toFixed(2);
        price = parseFloat(totalPrice);
      }
      const priceWithQuantity = (parseFloat(price.toString()) * item.quantity).toFixed(2);
      price = parseFloat(priceWithQuantity);
      item.optionName = optionNameList.join(',');
      item.totalPrice = price;
      // Real Price //
      const realPriceWithQuantity = (parseFloat(realPrice.toString()) * item.quantity).toFixed(2);
      realPrice = parseFloat(realPriceWithQuantity);
      item.realPrice = realPrice;
      const restItemDiscountString = (parseFloat(item.realPrice.toString()) - parseFloat(price.toString())).toFixed(2);
      const restItemDiscount = parseFloat(restItemDiscountString);
      item.itemDiscount = restItemDiscount;
      // Real Price //
    });

    let itemTotal: number = 0;
    let realPrice: number = 0;
    let itemDiscount: number = 0;
    this.posItems.forEach((item) => {
      const countTotal = (parseFloat(itemTotal.toString()) + parseFloat(item.totalPrice.toString())).toFixed(2);
      itemTotal = parseFloat(countTotal);
      const realCountTotal = (parseFloat(realPrice.toString()) + parseFloat(item.realPrice.toString())).toFixed(2);
      realPrice = parseFloat(realCountTotal);
      const itemDisountCountTotal = (parseFloat(itemDiscount.toString()) + parseFloat(item.itemDiscount.toString())).toFixed(2);
      itemDiscount = parseFloat(itemDisountCountTotal);
    });
    this.itemTotal = itemTotal;
    this.realTotal = realPrice;
    this.itemDiscount = itemDiscount;
    this.foodServiceCharge = this.calculateFoodTax();
    this.grandTotal = this.calculateGrandTotal();
    this.translateCartItem();
  }

  deleteItemFromCart(uuid: string) {
    console.log(uuid);
    this.posItems = this.posItems.filter((x) => x.uuid != uuid);
    this.calculateItemTotal();
  }

  quantityPosCartItemEvent(uuid: string, action: string) {
    console.log(`${uuid} ${action}`);
    const index = this.posItems.findIndex((x) => x.uuid == uuid);
    console.log(index);
    if (index != -1) {
      if (action == 'decrease') {
        if (this.posItems[index].quantity == 1) {
          this.posItems = this.posItems.filter((x) => x.uuid != uuid);
        } else {
          this.posItems[index].quantity = this.posItems[index].quantity - 1;
        }
      } else if (action == 'increase') {
        if (this.posItems[index].quantity < this.posItems[index].purchaseLimit) {
          let checkAddonHaveStock: string = 'true';
          let checkVariationHaveStock: string = 'true';
          let addonOutOfStockLimitNumber: number = 0;
          let variationOutOfStockLimitNumber: number = 0;
          this.posItems[index].addons.forEach((addon) => {
            if (this.posItems[index].quantity >= addon.stockNumber) {
              checkAddonHaveStock = 'false';
              if (addonOutOfStockLimitNumber == 0) {
                addonOutOfStockLimitNumber = addon.stockNumber;
              }
            }
          });
          this.posItems[index].variations.forEach((variation) => {
            variation.options.forEach((options) => {
              if (this.posItems[index].quantity >= options.stock) {
                checkVariationHaveStock = 'false';
                if (variationOutOfStockLimitNumber == 0) {
                  variationOutOfStockLimitNumber = options.stock;
                }
              }
            });
          });
          if (this.posItems[index].stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.posItems[index].quantity = this.posItems[index].quantity + 1;
          } else if (this.posItems[index].quantity < this.posItems[index].stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.posItems[index].quantity = this.posItems[index].quantity + 1;
          } else {
            if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
              this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
            } else {
              this.util.onError('ts_stock_limit_error', `${this.posItems[index].stockNumber}`);
            }
          }
        } else {
          this.util.onError('ts_purchase_error', `${this.posItems[index].purchaseLimit}`);
        }
      }
      this.calculateItemTotal();
    }
  }

  onDiscountChangeEvent(event: MatSelectChange) {
    console.log(event);
    this.discountType = event.value;
    this.calculateItemTotal();
  }

  onDiscountTypeChangeEvent(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue != '') {
      const usedDiscountPrice = parseFloat(filterValue).toFixed(2);
      this.usedDiscountPrice = parseFloat(usedDiscountPrice);
      this.calculateItemTotal();
    } else {
      this.usedDiscountPrice = 0;
      this.discountAmount = 0;
      this.calculateItemTotal();
    }
  }

  calculateFoodTax(): number {
    let taxCharge: number = 0;
    if (this.includeTaxOnFood) {
      if (this.foodTaxType == 'per') {
        function percentage(numFirst: number, per: number) {
          return (numFirst / 100) * per;
        }
        const total = (parseFloat(percentage(this.itemTotal, this.foodTaxAmount).toString())).toFixed(2);
        taxCharge = parseFloat(total);
      } else {
        taxCharge = this.foodTaxAmount;
      }
    }
    return taxCharge;
  }

  calculateGrandTotal(): number {
    let grandTotal = 0;
    const itemTotal: number = parseFloat(this.itemTotal.toString());
    const taxCharge: number = parseFloat(this.foodServiceCharge.toString());
    const serviceCharge: number = parseFloat(this.serviceCharge.toString());
    const packagingCharges: number = parseFloat(this.packagingCharges.toString());
    const packagingChargesTax: number = parseFloat(this.packagingChargesTax.toString());
    let discount: number = 0;
    if (this.itemTotal > 0) {
      if (this.discountType == 'amount') {
        discount = this.usedDiscountPrice;
      } else if (this.discountType == 'per') {
        function percentage(numFirst: number, per: number) {
          return (numFirst / 100) * per;
        }
        const discountString = (parseFloat(percentage(this.itemTotal, this.usedDiscountPrice).toString())).toFixed(2);
        discount = parseFloat(discountString);
      }
    }
    this.discountAmount = discount;
    const total = (itemTotal + taxCharge + serviceCharge + packagingCharges + packagingChargesTax).toFixed(2);
    const subTotal = parseFloat(total);
    const grandCount = (subTotal - discount).toFixed(2);
    grandTotal = parseFloat(grandCount);
    return grandTotal;
  }

  removePriceEvent(priceName: String) {
    console.log(priceName);
    if (priceName == 'foodServiceCharge') {
      this.foodTaxAmount = 0;
      this.foodServiceCharge = 0;
    } else if (priceName == 'serviceCharge') {
      this.serviceCharge = 0;
    } else if (priceName == 'packageCharge') {
      this.packagingCharges = 0;
    } else if (priceName == 'packageChargeTax') {
      this.packagingChargesTax = 0;
    } else if (priceName == 'discount') {
      this.usedDiscountPrice = 0;
      this.discountAmount = 0;
    }
    this.calculateItemTotal();
  }

  onCustomerChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event.value == 'regular') {
      this.customerForm.controls['customerContact'].setValue('');
      this.customerForm.controls['customerName'].setValue('');
    } else {
      this.customerForm.controls['customerContact'].setValue('none');
      this.customerForm.controls['customerName'].setValue('none');
    }
    this.customerType = event.value;
  }

  get f() {
    return this.customerForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.customerForm.controls['customerCountryCode'].setValue(splitString[1]);
      }
    }
  }

  onSubmit() {
    console.log('submit');
    this.haveSubmitClicked = true;
    console.log(this.customerForm.valid);
    if (this.customerForm.valid) {
      const cartItemRaw: any[] = [];
      this.posItems.forEach((inCartItem) => {
        console.log(`Name --> ${inCartItem.name}`);
        const newAddonIds: string[] = [];
        const serverVariations: any[] = [];
        inCartItem.addons.forEach((element) => {
          newAddonIds.push(element.id);
        });
        inCartItem.variations.forEach((variation) => {
          const selectedOptions: string[] = [];
          variation.options.forEach((options) => {
            selectedOptions.push(options.name);
          });
          const saveIt = {
            variation: variation.title,
            selected: selectedOptions,
          };
          serverVariations.push(saveIt);
        });
        const itemInCart = {
          'uuid': inCartItem.uuid,
          'addons': newAddonIds.join(','),
          'food': inCartItem.id,
          'quantity': inCartItem.quantity,
          'variations': serverVariations,
          'instruction': inCartItem.instruction
        };
        cartItemRaw.push(itemInCart);
      });
      console.log(JSON.stringify(cartItemRaw));
      const param = {
        'restaurant': this.util.getItem('_vendorId'),
        'paymentMode': this.paymentMode,
        'customerType': this.customerType,
        'customerName': this.customerForm.controls['customerName'].value,
        'customerCountryCode': this.customerForm.controls['customerCountryCode'].value,
        'customerMobileNumber': this.customerForm.controls['customerContact'].value,
        'cartItemRaw': JSON.stringify(cartItemRaw),
        'discountType': this.discountType,
        'discountAmount': this.usedDiscountPrice,
        'foodServiceCharge': this.foodServiceCharge,
        'serviceCharge': this.serviceCharge,
        'packageCharge': this.packagingCharges,
        'packageChargeTax': this.packagingChargesTax,
        'extraCharge': 0,
      };
      console.log(param);
      const spinnerRef = this.util.start('ts_placing_order');
      this.api.post_private('v1/vendor_web/restaurant/posPlaceOrder/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_order_placed');
          this.posItems = [];
          this.calculateItemTotal();
          this.getInitialData();
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  clearCart() {
    this.posItems = [];
    this.calculateItemTotal();
  }

  onOrderList() {
    this.router.navigate(['/vendor/pos-management/pos-order-list/']);
  }

}
