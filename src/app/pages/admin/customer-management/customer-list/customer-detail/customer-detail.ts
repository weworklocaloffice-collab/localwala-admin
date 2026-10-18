import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { CustomerPersonalDetail } from "./customer-personal-detail/customer-personal-detail";
import { CustomerOrderList } from "./customer-order-list/customer-order-list";
import { CustomerDiningBookingList } from "./customer-dining-booking-list/customer-dining-booking-list";
import { CustomerPurchasedTiffinPackages } from "./customer-purchased-tiffin-packages/customer-purchased-tiffin-packages";
import { CustomerDeliveryAddressList } from "./customer-delivery-address-list/customer-delivery-address-list";
import { CustomerRefundRequestList } from "./customer-refund-request-list/customer-refund-request-list";
import { CustomerComplaintsList } from "./customer-complaints-list/customer-complaints-list";
import { CustomerFavouriteList } from "./customer-favourite-list/customer-favourite-list";
import { CustomerHiddenRestaurants } from "./customer-hidden-restaurants/customer-hidden-restaurants";
import { CustomerWalletTransactions } from "./customer-wallet-transactions/customer-wallet-transactions";
import { CustomerGivenReviews } from "./customer-given-reviews/customer-given-reviews";
import { CustomerMediaFiles } from "./customer-media-files/customer-media-files";

@Component({
  selector: 'app-customer-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    CustomerPersonalDetail,
    CustomerOrderList,
    CustomerDiningBookingList,
    CustomerPurchasedTiffinPackages,
    CustomerDeliveryAddressList,
    CustomerRefundRequestList,
    CustomerComplaintsList,
    CustomerFavouriteList,
    CustomerHiddenRestaurants,
    CustomerWalletTransactions,
    CustomerGivenReviews,
    CustomerMediaFiles
  ],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {

  customerId: string = '';
  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.customerId);
    if (this.customerId == '') {
      this.util.onError('ts_something_went_wrong', '');
      this.onBack();
    }
  }

  onBack() {
    this.location.back();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    this.tabIndex = tabChangeEvent.index;
  }

}
