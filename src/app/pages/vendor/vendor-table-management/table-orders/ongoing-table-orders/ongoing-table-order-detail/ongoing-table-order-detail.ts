import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { VendorTableOrderDetailInterface } from 'src/app/interfaces/vendor.table.order.detail.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Observable, map, startWith } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-ongoing-table-order-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './ongoing-table-order-detail.html',
})
export class OngoingTableOrderDetail {

  id: string = '';
  tableId: string = '';
  items: VendorTableOrderDetailInterface[] = [];
  cartItemColumn: string[] = ['name', 'quantity', 'totalPrice', 'action'];
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
    private route: ActivatedRoute,
    private navCtrl: Location,
    private dialog: MatDialog,
  ) {
    this.customerForm.controls['customerCountryCode'].setValue(this.api.defaultCountryCode);
    this.getCountryCodes();
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.tableId = this.route.snapshot.paramMap.get('table') ?? '';
    if (this.id != null && this.id != '' && this.tableId != null && this.tableId != '') {
      this.getOrderDetail();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.navCtrl.back();
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

  getOrderDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/table_order/ongoingOrderDetail/' + this.util.getItem('_vendorId') + '/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          if (response && response.items && response.items.length) {
            const mappedList = response.items.map(
              (item: VendorTableOrderDetailInterface) => {
                const optionNameList: string[] = [];
                if (item && item.foodInfo && item.foodInfo?.id) {
                  if (item.foodInfo?.translations) {
                    const translation = item.foodInfo.translations.find((t) => t.code == this.util.appLocaleName());
                    item.foodInfo.displayName = translation?.title || item.foodInfo.name;
                  } else {
                    item.foodInfo.displayName = item.foodInfo?.name || '';
                  }
                }

                item.addons.map((addonItem) => {
                  if (addonItem?.translations) {
                    const translation = addonItem.translations.find((t) => t.code == this.util.appLocaleName());
                    addonItem.displayName = translation?.value || addonItem.name;
                  } else {
                    addonItem.displayName = addonItem?.name || '';
                  }
                  optionNameList.push(addonItem.displayName);
                });

                item.variations?.map((variationElement) => {
                  variationElement?.selected?.map((optionElement) => {
                    optionNameList.push(optionElement);
                  });
                });


                item.optionName = optionNameList.join(',');
                return item;
              }
            );
            mappedList.forEach((element: VendorTableOrderDetailInterface) => {
              let price = parseFloat(parseFloat(element.foodInfo.price!.toString()).toFixed(2));
              let offerPrice = 0;
              if (element && element.foodInfo && element.foodInfo.taxationEnable && element.foodInfo.taxationEnable == true) {
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


              if (element && element.addons && element.addons.length) {
                element.addons.forEach((addon: any) => {
                  price = price + parseFloat(parseFloat(addon.price).toFixed(2));
                });
              }

              if (element && element.variations && element.variations.length) {
                element.variations.forEach((savedVariation: any) => {
                  savedVariation.selected.forEach((selectedOption: any) => {
                    if (element && element.foodInfo && element.foodInfo.foodVariations && element.foodInfo.foodVariations.length) {
                      element.foodInfo.foodVariations.forEach((foodVariation: any) => {
                        foodVariation.options.forEach((foodOptions: any) => {
                          if (savedVariation.variation == foodVariation.title && selectedOption == foodOptions.name) {
                            price = price + parseFloat(parseFloat(foodOptions.price).toFixed(2));
                          }
                        });
                      });
                    }
                  });
                });
              }
              if (element && element.foodInfo && element.foodInfo.discount && parseFloat(element.foodInfo.discount!.toString()) > 0) {
                if (element.foodInfo.discountType == '%') {
                  const discountValue = (parseFloat(price.toString()) - (parseFloat(price.toString()) * parseFloat(element.foodInfo.discount.toString()) / 100)).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                } else {
                  const discountValue = (parseFloat(price.toString()) - parseFloat(element.foodInfo.discount.toString())).toFixed(2);
                  offerPrice = parseFloat(discountValue);
                }
              } else {
                offerPrice = parseFloat(price.toFixed(2));
              }

              const finalOfferPrice = (offerPrice * parseInt(element.quantity!.toString())).toFixed(2);
              offerPrice = parseFloat(finalOfferPrice);

              const realPrice = (price * parseInt(element.quantity!.toString())).toFixed(2);

              const discountInAmount = (parseFloat(realPrice.toString()) - parseFloat(offerPrice.toString())).toFixed(2);
              const itemParam = {
                uuid: element.uuid,
                addons: element.addons,
                food: element.food,
                quantity: element.quantity,
                variations: element.variations,
                instruction: element.instruction,
                foodtaxations: element.foodtaxations,
                id: element.id,
                foodInfo: element.foodInfo,
                itemPrice: offerPrice,
                realPrice: parseFloat(realPrice),
                itemDiscount: parseFloat(discountInAmount),
                optionName: element.optionName
              }
              this.items.push(itemParam);
            });

          } else {
            this.util.onError('ts_something_went_wrong', '');
            this.navCtrl.back();
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

          this.calculateItemTotal();

        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.navCtrl.back();
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  calculateItemTotal() {
    let realTotal: number = 0;
    let itemTotal: number = 0;
    let itemDiscount: number = 0;
    this.items.forEach((item) => {
      const countTotal = (parseFloat(itemTotal.toString()) + parseFloat(item.itemPrice.toString())).toFixed(2);
      itemTotal = parseFloat(countTotal);
      const countRealTotal = (parseFloat(realTotal.toString()) + parseFloat(item.realPrice.toString())).toFixed(2);
      realTotal = parseFloat(countRealTotal);
      const countItemDiscountTotal = (parseFloat(itemDiscount.toString()) + parseFloat(item.itemDiscount.toString())).toFixed(2);
      itemDiscount = parseFloat(countItemDiscountTotal);
    });
    this.itemTotal = itemTotal;
    this.realTotal = realTotal;
    this.itemDiscount = itemDiscount;
    this.foodServiceCharge = this.calculateFoodTax();
    this.grandTotal = this.calculateGrandTotal();
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
    console.log('On Submit');
    this.haveSubmitClicked = true;
    console.log(this.customerForm.valid);
    if (this.customerForm.valid) {
      const param = {
        'restaurant': this.util.getItem('_vendorId'),
        'tableId': this.id,
        'paymentMode': this.paymentMode,
        'customerType': this.customerType,
        'customerName': this.customerForm.controls['customerName'].value,
        'customerCountryCode': this.customerForm.controls['customerCountryCode'].value,
        'customerMobileNumber': this.customerForm.controls['customerContact'].value,
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
      this.api.post_private('v1/vendor_web/table_order/completeTableOrder/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_order_completed');
          this.navCtrl.back();
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  onDeleteItem(item: VendorTableOrderDetailInterface) {
    console.log(item);
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_alert_remove_cart_title', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.action && result.action == "confirm") {
        console.log('confirmed');
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/vendor_web/table_order/deleteTableOrderCartItem/' + this.util.getItem('_vendorId') + '/' + item.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.util.stop(spinnerRef);
            this.items = this.items.filter((x) => x.uuid != item.uuid);
            this.calculateItemTotal();
            if (this.items.length == 0) {
              this.navCtrl.back();
            }
          }, error: (error: any) => {
            console.log(error);
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'vendor');
          }
        });
      }
    });

  }

}
