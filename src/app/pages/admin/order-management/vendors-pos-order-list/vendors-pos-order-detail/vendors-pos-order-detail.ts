import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { OrderCartListInterface } from 'src/app/interfaces/order.cart.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-vendors-pos-order-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './vendors-pos-order-detail.html',
})
export class VendorsPosOrderDetail {

  cartItem = new MatTableDataSource<OrderCartListInterface>([]);
  displayedColumn = ['id', 'detail', 'qty', 'price'];
  id: string = '';
  createdAt: string = '';
  customerCountryCode: string = '';
  customerMobileNumber: string = '';
  customerName: string = '';
  customerType: string = '';
  discountAmount: number = 0;
  discountCharge: number = 0;
  discountType: string = '';
  extraCharge: number = 0;
  foodServiceCharge: number = 0;
  grandTotal: number = 0;
  itemTotal: number = 0;
  realTotal: number = 0;
  itemDiscount: number = 0;
  orderFrom: string = '';
  orderNo: number = 0;
  packageCharge: number = 0;
  packageChargeTax: number = 0;
  paymentMode: string = '';
  serviceCharge: number = 0;
  restaurantCommission: number = 0;
  restaurantName: string = '';
  restaurantId: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != '') {
      this.getInfo();
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/posOrders/detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true) {
          const detail = response.details;
          const mappedList = detail.cartItem.map(
            (item: OrderCartListInterface) => {
              const optionNameList: string[] = [];
              if (item.translations) {
                const translation = item.translations.find((t) => t.code == this.util.appLocaleName());
                item.displayName = translation?.title || item.name;
                item.displayShortDescription = translation?.shortDescription || item.shortDescription;
              } else {
                item.displayName = item?.name || '';
                item.displayShortDescription = item?.shortDescription || '';
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
                variationElement?.options?.map((optionElement) => {
                  optionNameList.push(optionElement.name);
                });
              });

              if (item && item.restaurantInfo && item.restaurantInfo?.id) {
                if (item.restaurantInfo?.translations) {
                  const translation = item.restaurantInfo.translations.find((t) => t.code == this.util.appLocaleName());
                  item.restaurantInfo.displayName = translation?.title || item.restaurantInfo.name;
                } else {
                  item.restaurantInfo.displayName = item.restaurantInfo?.name || '';
                }
              }

              item.foodtaxations?.taxation?.map((taxItem) => {
                if (taxItem.translation) {
                  const translation = taxItem.translation.find((t) => t.code == this.util.appLocaleName());
                  taxItem.displayName = translation?.name || taxItem.name;
                } else {
                  taxItem.displayName = item?.name || '';
                }
              });

              item.optionName = optionNameList.join(',');
              return item;
            }
          );
          this.cartItem = new MatTableDataSource<OrderCartListInterface>(mappedList);

          const dt = DateTime.fromISO(detail.createdAt).setLocale(this.util.appLocaleName());
          this.createdAt = dt.toFormat("cccc, LLLL d") + dt.toFormat("o yyyy");
          this.customerCountryCode = `${detail.customerCountryCode}`;
          this.customerMobileNumber = detail.customerMobileNumber;
          this.customerName = detail.customerName;
          this.customerType = detail.customerType;
          this.discountAmount = detail.discountAmount;
          this.discountCharge = detail.discountCharge;
          this.discountType = detail.discountType;
          this.extraCharge = detail.extraCharge;
          this.foodServiceCharge = detail.foodServiceCharge;
          this.grandTotal = detail.grandTotal;
          this.itemTotal = detail.itemTotal;
          this.itemDiscount = detail.itemDiscount;
          this.realTotal = detail.realTotal;
          this.orderFrom = detail.orderFrom;
          this.orderNo = detail.orderNo;
          this.packageCharge = detail.packageCharge;
          this.packageChargeTax = detail.packageChargeTax;
          this.paymentMode = detail.paymentMode;
          this.serviceCharge = detail.serviceCharge;
          this.restaurantCommission = detail.totalEarning;
          if (detail && detail.restaurant && detail.restaurant.name) {
            this.restaurantName = detail.restaurant.name;
            this.restaurantId = detail.restaurant.id;

            if (detail && detail.restaurant && detail.restaurant.translations && Array.isArray(detail.restaurant.translations)) {
              if (detail.restaurant.translations) {
                const translation = detail.restaurant.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.restaurantName = translation?.title || detail.restaurant.name;
              }
            }
          }
        } else {
          this.util.onError('ts_something_went_wrong', '');
          this.onBack();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onBack() {
    this.location.back();
  }

  onRestaurantDetail() {
    if (this.restaurantId && this.restaurantId != '') {
      this.router.navigate(['admin/restaurant-management/restaurant-detail', this.restaurantId]);
    }
  }

  onFoodDetail(id: string) {
    this.router.navigate(['admin/foods/food-detail', id]);
  }

  onPrint() {
    this.router.navigate(['admin/order-management/vendors-pos-order-invoice', this.id]);
  }

}
