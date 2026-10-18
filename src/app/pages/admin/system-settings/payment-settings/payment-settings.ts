import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CodPayment } from "./config/cod-payment/cod-payment";
import { StripePayment } from "./config/stripe-payment/stripe-payment";
import { PaypalPayment } from "./config/paypal-payment/paypal-payment";
import { RazorpayPayment } from "./config/razorpay-payment/razorpay-payment";
import { InstamojoPayment } from "./config/instamojo-payment/instamojo-payment";
import { PaystackPayment } from "./config/paystack-payment/paystack-payment";
import { FlutterwavePayment } from "./config/flutterwave-payment/flutterwave-payment";
import { CashfreePayment } from "./config/cashfree-payment/cashfree-payment";
import { XenditPayment } from "./config/xendit-payment/xendit-payment";

@Component({
  selector: 'app-payment-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CodPayment,
    StripePayment,
    PaypalPayment,
    RazorpayPayment,
    InstamojoPayment,
    PaystackPayment,
    FlutterwavePayment,
    CashfreePayment,
    XenditPayment,
  ],
  templateUrl: './payment-settings.html',
})
export class PaymentSettings {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
