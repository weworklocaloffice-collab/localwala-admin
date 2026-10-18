import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { RestaurantDetailInfo } from "./restaurant-detail-info/restaurant-detail-info";
import { RestaurantDetailOrderList } from "./restaurant-detail-order-list/restaurant-detail-order-list";
import { RestaurantDetailPosOrderList } from "./restaurant-detail-pos-order-list/restaurant-detail-pos-order-list";
import { RestaurantDetailTableOrderList } from "./restaurant-detail-table-order-list/restaurant-detail-table-order-list";
import { RestaurantDetailDiningList } from "./restaurant-detail-dining-list/restaurant-detail-dining-list";
import { RestaurantDetailFoodList } from "./restaurant-detail-food-list/restaurant-detail-food-list";
import { RestaurantDetailWaiterList } from "./restaurant-detail-waiter-list/restaurant-detail-waiter-list";
import { RestaurantDetailKitchenOwners } from "./restaurant-detail-kitchen-owners/restaurant-detail-kitchen-owners";
import { RestaurantDetailDeliverymanList } from "./restaurant-detail-deliveryman-list/restaurant-detail-deliveryman-list";
import { RestaurantDetailTiffinPackages } from "./restaurant-detail-tiffin-packages/restaurant-detail-tiffin-packages";
import { RestaurantDetailMediaFiles } from "./restaurant-detail-media-files/restaurant-detail-media-files";
import { RestaurantDetailReviews } from "./restaurant-detail-reviews/restaurant-detail-reviews";
import { RestaurantDetailRefundRequestList } from "./restaurant-detail-refund-request-list/restaurant-detail-refund-request-list";
import { RestaurantDetailComplaintsList } from "./restaurant-detail-complaints-list/restaurant-detail-complaints-list";
import { RestaurantDetailOutletList } from "./restaurant-detail-outlet-list/restaurant-detail-outlet-list";
import { RestaurantDetailDisbursementList } from "./restaurant-detail-disbursement-list/restaurant-detail-disbursement-list";
import { RestaurantDetailCollectedCashList } from "./restaurant-detail-collected-cash-list/restaurant-detail-collected-cash-list";
import { RestaurantDetailPayoutMethodList } from "./restaurant-detail-payout-method-list/restaurant-detail-payout-method-list";
import { RestaurantDetailWithdrawalRequestList } from "./restaurant-detail-withdrawal-request-list/restaurant-detail-withdrawal-request-list";
import { RestaurantDetailWalletTransactions } from "./restaurant-detail-wallet-transactions/restaurant-detail-wallet-transactions";

@Component({
  selector: 'app-restaurant-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon, RestaurantDetailInfo, RestaurantDetailOrderList, RestaurantDetailPosOrderList, RestaurantDetailTableOrderList, RestaurantDetailDiningList, RestaurantDetailFoodList, RestaurantDetailWaiterList, RestaurantDetailKitchenOwners, RestaurantDetailDeliverymanList, RestaurantDetailTiffinPackages, RestaurantDetailMediaFiles, RestaurantDetailReviews, RestaurantDetailRefundRequestList, RestaurantDetailComplaintsList, RestaurantDetailOutletList, RestaurantDetailDisbursementList, RestaurantDetailCollectedCashList, RestaurantDetailPayoutMethodList, RestaurantDetailWithdrawalRequestList, RestaurantDetailWalletTransactions],
  templateUrl: './restaurant-detail.html',
})
export class RestaurantDetail {

  restaurantId: string = '';
  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.restaurantId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.restaurantId);
    if (this.restaurantId == '') {
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
