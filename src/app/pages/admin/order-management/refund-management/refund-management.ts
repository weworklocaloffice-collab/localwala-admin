import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrderRefundRequest } from "./order-refund-request/order-refund-request";
import { TiffinSubscriptionRefundRequestList } from "./tiffin-subscription-refund-request-list/tiffin-subscription-refund-request-list";
import { DiningBookingRefundRequestList } from "./dining-booking-refund-request-list/dining-booking-refund-request-list";
import { RefundRequestReason } from "./refund-request-reason/refund-request-reason";
import { TiffinSubscriptionRefundRequestReason } from "./tiffin-subscription-refund-request-reason/tiffin-subscription-refund-request-reason";
import { DiningBookingRefundRequestReason } from "./dining-booking-refund-request-reason/dining-booking-refund-request-reason";

@Component({
  selector: 'app-refund-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, OrderRefundRequest, TiffinSubscriptionRefundRequestList, DiningBookingRefundRequestList, RefundRequestReason, TiffinSubscriptionRefundRequestReason, DiningBookingRefundRequestReason],
  templateUrl: './refund-management.html',
})
export class RefundManagement {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
