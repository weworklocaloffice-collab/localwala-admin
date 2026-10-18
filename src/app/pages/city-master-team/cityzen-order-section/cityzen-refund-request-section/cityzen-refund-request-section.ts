import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenOrderRefundRequest } from "./cityzen-order-refund-request/cityzen-order-refund-request";
import { CityzenTiffinSubscriptionRefundRequest } from "./cityzen-tiffin-subscription-refund-request/cityzen-tiffin-subscription-refund-request";
import { CityzenDiningBookingRefundRequest } from "./cityzen-dining-booking-refund-request/cityzen-dining-booking-refund-request";

@Component({
  selector: 'app-cityzen-refund-request-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenOrderRefundRequest, CityzenTiffinSubscriptionRefundRequest, CityzenDiningBookingRefundRequest],
  templateUrl: './cityzen-refund-request-section.html',
})
export class CityzenRefundRequestSection {

  tabIndex: number = 0;

  constructor(public util: UtilService) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
