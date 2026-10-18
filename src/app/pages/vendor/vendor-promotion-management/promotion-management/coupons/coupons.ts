import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrdersCouponList } from "./orders-coupon-list/orders-coupon-list";
import { DiningCouponList } from "./dining-coupon-list/dining-coupon-list";

@Component({
  selector: 'app-coupons',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, OrdersCouponList, DiningCouponList],
  templateUrl: './coupons.html',
})
export class Coupons {

  canAddDiningCoupon: boolean = false;
  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getPermission();
  }

  getPermission() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/dining/getSetting/').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.restaurantCanAddOffers == true) {
          const _vendorPreBooking = this.util.getItem('_vendorPreBooking');
          if (_vendorPreBooking == 'true') {
            this.canAddDiningCoupon = true;
          }
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
