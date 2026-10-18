import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerCartItemRepeatModalInterface } from 'src/app/interfaces/customer.cart.item.repeat.modal.interface';
import { CustomerTableOrderCartItemInterface } from 'src/app/interfaces/customer.table.order.cart.item.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-table-order-repeat-item',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './dialog-table-order-repeat-item.html',
})
export class DialogTableOrderRepeatItem {

  cartItem: CustomerTableOrderCartItemInterface[] = [];
  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogTableOrderRepeatItem>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(this.data.info)) {
      const list = JSON.parse(this.data.info);
      this.cartItem = [...list];
      console.log(this.cartItem);
    } else {
      this.cartItem = [];
    }
  }

  ngOnDestroy(): void {
    this.data.info = [];
  }

  quantityCartItemEvent(uuid: string, action: string) {
    console.log(`${uuid} ${action}`);
    const index = this.cartItem.findIndex((x) => x.uuid == uuid);
    console.log(index);
    if (index != -1) {
      if (action == 'decrease') {
        console.log(`Quantity -- ${this.cartItem[index].quantity} purchase Limit --> ${this.cartItem[index].purchaseLimit}`);
        if (this.cartItem[index].quantity == 1) {
          console.log('Remove From Cart');
          this.cartItem[index].quantity = 0;
          const newItem = this.cartItem.filter((x) => x.quantity == 0);
          console.log(newItem.length, this.cartItem.length)
          if (newItem.length == this.cartItem.length) {
            this.onUpdateCart();
          }
        } else {
          this.cartItem[index].quantity = this.cartItem[index].quantity - 1;
        }
      } else if (action == 'increase') {
        console.log(`Quantity -- ${this.cartItem[index].quantity} purchase Limit --> ${this.cartItem[index].purchaseLimit}`);
        if (this.cartItem[index].quantity < this.cartItem[index].purchaseLimit) {
          let checkAddonHaveStock: string = 'true';
          let checkVariationHaveStock: string = 'true';
          let addonOutOfStockLimitNumber: number = 0;
          let variationOutOfStockLimitNumber: number = 0;
          this.cartItem[index].addons.forEach((addon) => {
            if (this.cartItem[index].quantity >= addon.stockNumber) {
              checkAddonHaveStock = 'false';
              if (addonOutOfStockLimitNumber == 0) {
                addonOutOfStockLimitNumber = addon.stockNumber;
              }
            }
          });
          this.cartItem[index].variations.forEach((variation) => {
            variation.options.forEach((options) => {
              if (this.cartItem[index].quantity >= options.stock) {
                checkVariationHaveStock = 'false';
                if (variationOutOfStockLimitNumber == 0) {
                  variationOutOfStockLimitNumber = options.stock;
                }
              }
            });
          });
          if (this.cartItem[index].stockType == 'unlimited' && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.cartItem[index].quantity = this.cartItem[index].quantity + 1;
          } else if (this.cartItem[index].quantity < this.cartItem[index].stockNumber && checkAddonHaveStock == 'true' && checkVariationHaveStock == 'true') {
            this.cartItem[index].quantity = this.cartItem[index].quantity + 1;
          } else {
            if (checkAddonHaveStock == 'false' || checkVariationHaveStock == 'false') {
              this.util.onError('ts_variation_limit_error', `${checkAddonHaveStock == 'false' ? addonOutOfStockLimitNumber : variationOutOfStockLimitNumber}`);
            } else {
              this.util.onError('ts_stock_limit_error', `${this.cartItem[index].stockNumber}`);
            }
          }
        } else {
          this.util.onError('ts_purchase_error', `${this.cartItem[index].purchaseLimit}`);
        }
      }


      this.calculateItemTotal();
    }
  }

  calculateItemTotal() {
    this.cartItem.forEach((item) => {
      let price: number = 0;
      let addonPrice: number = 0;
      let variationPrice: number = 0;
      // Real Price //
      let realPrice: number = 0.0;
      let addonRealPrice: number = 0.0;
      let variationRealPrice: number = 0.0;
      // Real Price //

      item.addons.forEach((addons) => {
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
  }

  onNewCustomisation() {
    this.dialogRef.close({ 'kind': 'new', 'success': true });
  }

  onUpdateCart() {
    console.log('Update Cart');
    console.log(this.cartItem);
    const mappedItem = this.cartItem.map((item: CustomerTableOrderCartItemInterface) => {
      const param: CustomerCartItemRepeatModalInterface = {
        uuid: item.uuid,
        qty: item.quantity
      };
      return param;
    });
    const cartItem: CustomerCartItemRepeatModalInterface[] = mappedItem;
    this.dialogRef.close({ 'kind': 'update', 'items': cartItem, 'success': true });
  }

}
