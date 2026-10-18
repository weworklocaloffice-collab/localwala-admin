import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CouponList } from "./coupon-list/coupon-list";
import { CouponRequest } from "./coupon-request/coupon-request";
import { DiningCouponList } from "./dining-coupon-list/dining-coupon-list";
import { DiningCouponRequest } from "./dining-coupon-request/dining-coupon-request";

@Component({
  selector: 'app-coupons',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CouponList, CouponRequest, DiningCouponList, DiningCouponRequest],
  templateUrl: './coupons.html',
})
export class Coupons {

  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
