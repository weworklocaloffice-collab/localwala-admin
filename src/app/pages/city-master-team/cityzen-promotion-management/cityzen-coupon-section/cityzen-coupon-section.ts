import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenCouponList } from "./cityzen-coupon-list/cityzen-coupon-list";
import { CityzenCouponRequest } from "./cityzen-coupon-list/cityzen-coupon-request/cityzen-coupon-request";
import { CityzenDiningCouponList } from "./cityzen-dining-coupon-list/cityzen-dining-coupon-list";
import { CityzenDiningCouponRequest } from "./cityzen-dining-coupon-list/cityzen-dining-coupon-request/cityzen-dining-coupon-request";

@Component({
  selector: 'app-cityzen-coupon-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenCouponList, CityzenCouponRequest, CityzenDiningCouponList, CityzenDiningCouponRequest],
  templateUrl: './cityzen-coupon-section.html',
})
export class CityzenCouponSection {

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
