import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomerMenuFoodInterface } from 'src/app/interfaces/customer.menu.food.interface';
import { PosAddonDetailFoodDialogInterface } from 'src/app/interfaces/pos.addon.detail.food.dialog.interface';
import { PosVariationDetailFoodDialogInterface, PosVariationOptionFoodDialogInterface } from 'src/app/interfaces/pos.variation.detail.food.dialog.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-table-order-food-variation-fresh',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './dialog-table-order-food-variation-fresh.html',
})
export class DialogTableOrderFoodVariationFresh {

  name: string = '';
  originalPrice: number = 0;
  discountPrice: number = 0;
  addons: PosAddonDetailFoodDialogInterface[] = [];
  variations: PosVariationDetailFoodDialogInterface[] = [];
  quantity: number = 1;
  itemDetail: CustomerMenuFoodInterface;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogTableOrderFoodVariationFresh>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.info && this.data.info.id && this.data.info.name) {
      this.itemDetail = this.data.info;

      this.name = this.itemDetail.displayName;
      this.originalPrice = this.itemDetail.price;
      this.discountPrice = this.itemDetail.offerPrice;

      this.addons = [];
      const addonItems: PosAddonDetailFoodDialogInterface[] = this.itemDetail.addons.map((item) => {
        if (item.translations) {
          const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
          item.displayName = translation?.value || item.name;
        } else {
          item.displayName = item?.name || '';
        }
        let inStock = item.inStock;
        let haveDiscount = false;
        let discountPrice = 0;
        if (item.stockNumber == 0) {
          inStock = false;
        }

        if (this.itemDetail.discount > 0 && this.itemDetail.discountType == '%') {
          haveDiscount = true;
          const discount = this.itemDetail.discount;
          const discountValue = (parseFloat(item.price.toString()) - (parseFloat(item.price.toString()) * parseFloat(discount.toString()) / 100)).toFixed(2);
          discountPrice = parseFloat(discountValue);
        }

        const addonData: PosAddonDetailFoodDialogInterface = {
          'name': item.name,
          'translations': item.translations,
          'id': item.id,
          'price': item.price,
          'inStock': inStock,
          'haveDiscount': haveDiscount,
          'discountPrice': discountPrice,
          'stockNumber': item.stockNumber,
          'stockType': item.stockType,
          'checked': false,
          'limitCrossed': false,
          'displayName': item.displayName,
        };
        return addonData;
      });
      this.addons = [...addonItems];


      this.variations = [];

      const variationItems: PosVariationDetailFoodDialogInterface[] = this.itemDetail.variations.map((item) => {
        let options: PosVariationOptionFoodDialogInterface[] = [];
        if (item && item.options && Array.isArray(item.options)) {
          const optionMap = item.options.map((optionEl) => {
            let inStock = true;
            if (optionEl.stock == 0) {
              inStock = false;
            }
            let haveDiscount = false;
            let discountPrice = 0;
            if (this.itemDetail.discount > 0 && this.itemDetail.discountType == '%') {
              haveDiscount = true;
              const discount = this.itemDetail.discount;
              const discountValue = (parseFloat(optionEl.price.toString()) - (parseFloat(optionEl.price.toString()) * parseFloat(discount.toString()) / 100)).toFixed(2);
              discountPrice = parseFloat(discountValue);
            }

            const optionParam: PosVariationOptionFoodDialogInterface = {
              'name': optionEl.name,
              'price': optionEl.price,
              'stock': optionEl.stock,
              'haveDiscount': haveDiscount,
              'discountPrice': discountPrice,
              'checked': false,
              'limitCrossed': false,
              'enable': true,
              'inStock': inStock,
            };
            return optionParam;
          });
          options = optionMap;
        }

        const variationData: PosVariationDetailFoodDialogInterface = {
          'isRequired': item.isRequired,
          'title': item.title,
          'type': item.type,
          'min': item.min,
          'max': item.max,
          'options': options
        };
        return variationData;
      });
      this.variations = [...variationItems];

      console.log(this.addons);
      console.log(this.variations);
    }
  }

  addonSelectEvent(index: number) {
    if (index != -1) {
      if (this.addons[index].inStock) {
        this.addons[index].checked = !this.addons[index].checked;
        this.addons.forEach((element) => {
          element.limitCrossed = false;
        });
        this.variations.forEach((variation) => {
          variation.options.forEach((options) => {
            options.limitCrossed = false;
          });
        });
        this.quantity = 1;

        const realPrice = this.itemDetail.price;
        const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
        const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
        let originalPrice = parseFloat(originalPriceString);
        let discountPrice = this.itemDetail.offerPrice!;
        if (this.itemDetail.discountType == '%') {
          const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.itemDetail.discount.toString())) / 100).toFixed(2);
          const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
          discountPrice = parseFloat(discountedPriceString);
        } else {
          const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.itemDetail.discount.toString())).toFixed(2);
          discountPrice = parseFloat(discountPriceString);
        }
        const originalPriceStringFinal = (parseFloat(originalPrice.toString()) * this.quantity).toFixed(2);
        originalPrice = parseFloat(originalPriceStringFinal);
        const discountPriceStringFinal = (parseFloat(discountPrice.toString()) * this.quantity).toFixed(2);
        discountPrice = parseFloat(discountPriceStringFinal);
        this.originalPrice = originalPrice;
        this.discountPrice = discountPrice;
      }
    }
  }

  variationSelectEvent(vIndex: number, oIndex: number) {
    if (this.variations[vIndex].options[oIndex].inStock) {
      this.addons.forEach((addon) => {
        addon.limitCrossed = false;
      });
      if (this.variations[vIndex].type == 'single') {
        const radioIndex = this.variations[vIndex].options!.findIndex((element) => element.checked == true);
        if (radioIndex != -1) {
          this.variations[vIndex].options[radioIndex].checked = false;
          this.variations.forEach((variation) => {
            variation.options.forEach((options) => {
              options.limitCrossed = false;
            });
          });
          this.quantity = 1;
        }
        this.variations[vIndex].options[oIndex].checked = true;
        this.variations.forEach((variation) => {
          variation.options.forEach((options) => {
            options.limitCrossed = false;
          });
        });
        this.quantity = 1;
      } else {
        if (this.variations[vIndex].options[oIndex].checked || this.variations[vIndex].options[oIndex].enable) {
          this.variations[vIndex].options[oIndex].checked = !this.variations[vIndex].options[oIndex].checked;
          this.variations.forEach((variation) => {
            variation.options.forEach((options) => {
              options.limitCrossed = false;
            });
          });
          this.quantity = 1;
        }
        const totalChecked = this.variations[vIndex].options.filter((vOptions) => vOptions.checked == true);
        this.variations[vIndex].options.forEach((vOptions) => {
          if (!vOptions.checked && totalChecked.length >= this.variations[vIndex].max) {
            vOptions.enable = false;
          } else {
            vOptions.enable = true;
          }
        });
        this.variations.forEach((variation) => {
          variation.options.forEach((options) => {
            options.limitCrossed = false;
          });
        });
        this.quantity = 1;
      }
      const realPrice = this.itemDetail.price;
      const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
      const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
      let originalPrice = parseFloat(originalPriceString);
      let discountPrice = this.itemDetail.offerPrice!;
      if (this.itemDetail.discountType == '%') {
        const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.itemDetail.discount.toString())) / 100).toFixed(2);
        const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
        discountPrice = parseFloat(discountedPriceString);
      } else {
        const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.itemDetail.discount.toString())).toFixed(2);
        discountPrice = parseFloat(discountPriceString);
      }
      const originalPriceStringFinal = (parseFloat(originalPrice.toString()) * this.quantity).toFixed(2);
      originalPrice = parseFloat(originalPriceStringFinal);
      const discountPriceStringFinal = (parseFloat(discountPrice.toString()) * this.quantity).toFixed(2);
      discountPrice = parseFloat(discountPriceStringFinal);
      this.originalPrice = originalPrice;
      this.discountPrice = discountPrice;
    }
  }

  quantityEvent(action: string) {
    if (this.quantity == 1 && action == 'decrease') {
      this.quantity = 1;
    } else if (action == 'decrease') {
      this.quantity = this.quantity - 1;
    } else if (action == 'increase') {
      if (this.quantity! < this.itemDetail.purchaseLimit) {
        let checkAddonHaveStock: string = 'true';
        let checkVariationHaveStock: string = 'true';
        let outOfStockLimitNumber = 0;
        this.addons.forEach((addon) => {
          if (addon.checked! && this.quantity >= addon.stockNumber) {
            addon.limitCrossed = true;
            checkAddonHaveStock = 'false';
            outOfStockLimitNumber = addon.stockNumber!;
          }
        });
        this.variations.forEach((varition) => {
          varition.options.forEach((options) => {
            if (options.checked! && this.quantity >= options.stock!) {
              options.limitCrossed = true;
              checkVariationHaveStock = 'false';
              outOfStockLimitNumber = options.stock!;
            }
          });
        });
        if (this.itemDetail.stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
          this.quantity = this.quantity + 1;
        } else if (this.quantity < this.itemDetail.stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
          this.quantity = this.quantity + 1;
        } else {
          if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
            this.util.onError('ts_variation_limit_error', `${outOfStockLimitNumber}`);
          } else {
            this.util.onError('ts_stock_limit_error', `${this.itemDetail.stockNumber}`);
          }
        }
      } else {
        this.util.onError('ts_purchase_error', `${this.itemDetail.purchaseLimit}`);
      }
    }
    const realPrice = this.itemDetail.price;
    const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
    const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
    let originalPrice = parseFloat(originalPriceString);
    let discountPrice = this.itemDetail.offerPrice!;
    if (this.itemDetail.discountType == '%') {
      const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.itemDetail.discount.toString())) / 100).toFixed(2);
      const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
      discountPrice = parseFloat(discountedPriceString);
    } else {
      const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.itemDetail.discount.toString())).toFixed(2);
      discountPrice = parseFloat(discountPriceString);
    }
    const originalPriceStringFinal = (parseFloat(originalPrice.toString()) * this.quantity).toFixed(2);
    originalPrice = parseFloat(originalPriceStringFinal);
    const discountPriceStringFinal = (parseFloat(discountPrice.toString()) * this.quantity).toFixed(2);
    discountPrice = parseFloat(discountPriceStringFinal);
    this.originalPrice = originalPrice;
    this.discountPrice = discountPrice;
  }

  onAddToCartEvent() {
    const items = this.variations.filter((element) => element.isRequired == true);
    let requiredValidation = 'false';
    let minMaxValidation = 'false';
    items.forEach((variation) => {
      const checkIndex = variation.options!.findIndex((element) => element.checked == true);
      if (checkIndex == -1) {
        requiredValidation = 'true';
      }
    });
    this.variations.forEach((variation) => {
      const minOption = variation.min;
      const selectedOptions = variation.options!.filter((vOption) => vOption.checked == true);
      if (selectedOptions.length == 0 && variation.isRequired == false) {
        minMaxValidation = 'false';
      } else if (selectedOptions.length < minOption) {
        minMaxValidation = 'true';
      }
    });
    if (requiredValidation == 'false' && minMaxValidation == 'false') {
      const savedAddon: PosAddonDetailFoodDialogInterface[] = [];
      this.addons.forEach((element) => {
        if (element.checked == true) {
          savedAddon.push(element);
        }
      });
      const savedVariations: any[] = [];
      this.variations.forEach((variation) => {
        const savedOptions: any[] = [];
        variation.options.forEach((option) => {
          if (option.checked == true) {
            savedOptions.push(option);
          }
        });
        if (savedOptions.length > 0) {
          const savedVariationParam = {
            isRequired: variation.isRequired,
            title: variation.title,
            type: variation.type,
            min: variation.min,
            max: variation.max,
            options: [...savedOptions]
          }
          savedVariations.push(savedVariationParam);
        }
      });
      this.dialogRef.close({ 'addons': savedAddon, 'quantity': this.quantity, 'variations': savedVariations, 'success': true });
    } else {
      this.util.onError('ts_validation_failed_required_items', '');
    }
  }

  calculateAddons(): number {
    let addonPrice = 0.0;
    this.addons.forEach((element) => {
      if (element.checked == true) {
        const price = (parseFloat(addonPrice.toString()) + (parseFloat(element.price.toString()))).toFixed(2);
        addonPrice = parseFloat(price);
      }
    });
    return addonPrice;
  }

  calculateVariations(): number {
    let variationPrice = 0.0;
    this.variations.forEach((variation) => {
      variation.options.forEach((options) => {
        if (options.checked == true) {
          const price = (parseFloat(variationPrice.toString()) + (parseFloat(options.price.toString()))).toFixed(2);
          variationPrice = parseFloat(price);
        }
      });
    });
    return variationPrice;
  }

}
