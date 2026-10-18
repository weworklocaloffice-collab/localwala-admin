import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PosAddonDetailFoodDialogInterface } from 'src/app/interfaces/pos.addon.detail.food.dialog.interface';
import { PosFoodInfoInterface } from 'src/app/interfaces/pos.food.info.interface';
import { PosVariationDetailFoodDialogInterface } from 'src/app/interfaces/pos.variation.detail.food.dialog.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-cityzen-pos-food-info-dialog',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './cityzen-pos-food-info-dialog.html',
})
export class CityzenPosFoodInfoDialog {

  product: PosFoodInfoInterface;
  addons: PosAddonDetailFoodDialogInterface[] = [];
  variations: PosVariationDetailFoodDialogInterface[] = [];
  originalPrice: number = 0;
  discountPrice: number = 0;
  quantity: number = 1;
  instruction: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CityzenPosFoodInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.info && this.data.info.id && this.data.info.name) {
      this.product = this.data.info;
      if (this.product.translations) {
        const translation = this.product.translations.find((t) => t.code == this.util.appLocaleName());
        this.product.displayName = translation?.title || this.product.name;
        this.product.displayShortDescription = translation?.shortDescription || this.product.shortDescription;
      } else {
        this.product.displayName = this.product?.name || '';
        this.product.displayShortDescription = this.product?.shortDescription || '';
      }
      this.originalPrice = this.product.price;
      this.discountPrice = this.product.offerPrice;
      this.addons = [];
      this.product.addons.map((element) => {
        if (element.translations) {
          const translation = element.translations.find((t) => t.code == this.util.appLocaleName());
          element.displayName = translation?.value || element.name;
        } else {
          element.displayName = element?.name || '';
        }
        let inStock = element.inStock;
        let haveDiscount = false;
        let discountPrice = 0;
        if (element.stockNumber == 0) {
          inStock = false;
        }
        if (this.product.discount > 0 && this.product.discountType == '%') {
          haveDiscount = true;
          const discount = this.product.discount;
          const discountValue = (parseFloat(element.price.toString()) - (parseFloat(element.price.toString()) * parseFloat(discount.toString()) / 100)).toFixed(2);
          discountPrice = parseFloat(discountValue);
        }
        const addonData: any = {
          'name': element.name,
          'translations': element.translations,
          'id': element.id,
          'price': element.price,
          'inStock': inStock,
          'haveDiscount': haveDiscount,
          'discountPrice': discountPrice,
          'stockNumber': element.stockNumber,
          'stockType': element.stockType,
          'checked': false,
          'limitCrossed': false,
          'displayName': element.displayName,
        };
        this.addons.push(addonData);
      });
      this.variations = [];
      this.product.variations.forEach((element) => {
        const options: any[] = [];
        if (element.options.length > 0) {
          element.options.forEach((variationOption) => {
            let inStock = true;
            if (variationOption.stock == 0) {
              inStock = false;
            }
            let haveDiscount = false;
            let discountPrice = 0;
            if (this.product.discount > 0 && this.product.discountType == '%') {
              haveDiscount = true;
              const discount = this.product.discount;
              const discountValue = (parseFloat(variationOption.price.toString()) - (parseFloat(variationOption.price.toString()) * parseFloat(discount.toString()) / 100)).toFixed(2);
              discountPrice = parseFloat(discountValue);
            }
            const optionParam = {
              'name': variationOption.name,
              'price': variationOption.price,
              'stock': variationOption.stock,
              'haveDiscount': haveDiscount,
              'discountPrice': discountPrice,
              'checked': false,
              'limitCrossed': false,
              'enable': true,
              'inStock': inStock,
            };
            options.push(optionParam);
          });
        }
        const variationData: any = {
          'isRequired': element.isRequired,
          'title': element.title,
          'type': element.type,
          'min': element.min,
          'max': element.max,
          'options': options
        };
        this.variations.push(variationData);
      });
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

        const realPrice = this.product.price;
        const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
        const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
        let originalPrice = parseFloat(originalPriceString);
        let discountPrice = this.product.offerPrice!;
        if (this.product.discountType == '%') {
          const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.product.discount.toString())) / 100).toFixed(2);
          const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
          discountPrice = parseFloat(discountedPriceString);
        } else {
          const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.product.discount.toString())).toFixed(2);
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
      const realPrice = this.product.price;
      const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
      const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
      let originalPrice = parseFloat(originalPriceString);
      let discountPrice = this.product.offerPrice!;
      if (this.product.discountType == '%') {
        const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.product.discount.toString())) / 100).toFixed(2);
        const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
        discountPrice = parseFloat(discountedPriceString);
      } else {
        const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.product.discount.toString())).toFixed(2);
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
      if (this.quantity! < this.product.purchaseLimit) {
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
        if (this.product.stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
          this.quantity = this.quantity + 1;
        } else if (this.quantity < this.product.stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
          this.quantity = this.quantity + 1;
        } else {
          if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
            this.util.onError('ts_variation_limit_error', `${outOfStockLimitNumber}`);
          } else {
            this.util.onError('ts_stock_limit_error', `${this.product.stockNumber}`);
          }
        }
      } else {
        this.util.onError('ts_purchase_error', `${this.product.purchaseLimit}`);
      }
    }
    const realPrice = this.product.price;
    const extraPriceString = (parseFloat(this.calculateAddons().toString()) + (parseFloat(this.calculateVariations().toString()))).toFixed(2);
    const originalPriceString = (parseFloat(realPrice.toString()) + parseFloat(extraPriceString)).toFixed(2);
    let originalPrice = parseFloat(originalPriceString);
    let discountPrice = this.product.offerPrice!;
    if (this.product.discountType == '%') {
      const discountAmountString = ((parseFloat(originalPrice.toString()) * parseFloat(this.product.discount.toString())) / 100).toFixed(2);
      const discountedPriceString = (parseFloat(originalPrice.toString()) - parseFloat(discountAmountString)).toFixed(2);
      discountPrice = parseFloat(discountedPriceString);
    } else {
      const discountPriceString = (parseFloat(originalPrice.toString()) - parseFloat(this.product.discount.toString())).toFixed(2);
      discountPrice = parseFloat(discountPriceString);
    }
    const originalPriceStringFinal = (parseFloat(originalPrice.toString()) * this.quantity).toFixed(2);
    originalPrice = parseFloat(originalPriceStringFinal);
    const discountPriceStringFinal = (parseFloat(discountPrice.toString()) * this.quantity).toFixed(2);
    discountPrice = parseFloat(discountPriceStringFinal);
    this.originalPrice = originalPrice;
    this.discountPrice = discountPrice;
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
      this.dialogRef.close({ 'addons': savedAddon, 'quantity': this.quantity, 'variations': savedVariations, 'instruction': this.instruction, 'success': true });
    } else {
      this.util.onError('ts_validation_failed_required_items', '');
    }
  }

}
