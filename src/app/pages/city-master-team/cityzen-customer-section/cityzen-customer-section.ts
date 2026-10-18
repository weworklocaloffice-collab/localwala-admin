import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { CityzenCustomerDetailPersonalDetail } from "./cityzen-customer-detail-personal-detail/cityzen-customer-detail-personal-detail";
import { CityzenCustomerDetailOrderList } from "./cityzen-customer-detail-order-list/cityzen-customer-detail-order-list";
import { CityzenCustomerDetailDiningBookingList } from "./cityzen-customer-detail-dining-booking-list/cityzen-customer-detail-dining-booking-list";
import { CityzenCustomerDetailPurchasedTiffinPackages } from "./cityzen-customer-detail-purchased-tiffin-packages/cityzen-customer-detail-purchased-tiffin-packages";
import { CityzenCustomerDetailDeliverymanAddressList } from "./cityzen-customer-detail-deliveryman-address-list/cityzen-customer-detail-deliveryman-address-list";
import { CityzenCustomerDetailRefundRequestList } from "./cityzen-customer-detail-refund-request-list/cityzen-customer-detail-refund-request-list";
import { CityzenCustomerDetailComplaintsList } from "./cityzen-customer-detail-complaints-list/cityzen-customer-detail-complaints-list";
import { CityzenCustomerDetailFavouriteList } from "./cityzen-customer-detail-favourite-list/cityzen-customer-detail-favourite-list";
import { CityzenCustomerDetailHiddenRestaurants } from "./cityzen-customer-detail-hidden-restaurants/cityzen-customer-detail-hidden-restaurants";
import { CityzenCustomerDetailWalletTransactions } from "./cityzen-customer-detail-wallet-transactions/cityzen-customer-detail-wallet-transactions";
import { CityzenCustomerDetailGivenReviews } from "./cityzen-customer-detail-given-reviews/cityzen-customer-detail-given-reviews";
import { CityzenCustomerDetailMediaFiles } from "./cityzen-customer-detail-media-files/cityzen-customer-detail-media-files";

@Component({
  selector: 'app-cityzen-customer-section',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    CityzenCustomerDetailPersonalDetail,
    CityzenCustomerDetailOrderList,
    CityzenCustomerDetailDiningBookingList,
    CityzenCustomerDetailPurchasedTiffinPackages,
    CityzenCustomerDetailDeliverymanAddressList,
    CityzenCustomerDetailRefundRequestList,
    CityzenCustomerDetailComplaintsList,
    CityzenCustomerDetailFavouriteList,
    CityzenCustomerDetailHiddenRestaurants,
    CityzenCustomerDetailWalletTransactions,
    CityzenCustomerDetailGivenReviews,
    CityzenCustomerDetailMediaFiles,
  ],
  templateUrl: './cityzen-customer-section.html',
})
export class CityzenCustomerSection {

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
    this.tabIndex = tabChangeEvent.index;
  }

}
