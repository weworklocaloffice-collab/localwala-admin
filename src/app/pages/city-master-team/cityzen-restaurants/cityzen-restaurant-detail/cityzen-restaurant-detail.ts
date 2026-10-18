import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { CityzenRestaurantDetailInfo } from "./cityzen-restaurant-detail-info/cityzen-restaurant-detail-info";
import { CityzenRestaurantDetailOrderList } from "./cityzen-restaurant-detail-order-list/cityzen-restaurant-detail-order-list";
import { CityzenRestaurantDetailPosOrderList } from "./cityzen-restaurant-detail-pos-order-list/cityzen-restaurant-detail-pos-order-list";
import { CityzenRestaurantDetailTableOrderList } from "./cityzen-restaurant-detail-table-order-list/cityzen-restaurant-detail-table-order-list";
import { CityzenRestaurantDetailDiningList } from "./cityzen-restaurant-detail-dining-list/cityzen-restaurant-detail-dining-list";
import { CityzenRestaurantDetailFoodList } from "./cityzen-restaurant-detail-food-list/cityzen-restaurant-detail-food-list";
import { CityzenRestaurantDetailWaiterList } from "./cityzen-restaurant-detail-waiter-list/cityzen-restaurant-detail-waiter-list";
import { CityzenRestaurantDetailKitchenOwnerList } from "./cityzen-restaurant-detail-kitchen-owner-list/cityzen-restaurant-detail-kitchen-owner-list";
import { CityzenRestaurantDetailDeliverymanList } from "./cityzen-restaurant-detail-deliveryman-list/cityzen-restaurant-detail-deliveryman-list";
import { CityzenRestaurantDetailTiffinPackages } from "./cityzen-restaurant-detail-tiffin-packages/cityzen-restaurant-detail-tiffin-packages";
import { CityzenRestaurantDetailRefundRequestList } from "./cityzen-restaurant-detail-refund-request-list/cityzen-restaurant-detail-refund-request-list";
import { CityzenRestaurantDetailComplaintsList } from "./cityzen-restaurant-detail-complaints-list/cityzen-restaurant-detail-complaints-list";
import { CityzenRestaurantDetailOutletList } from "./cityzen-restaurant-detail-outlet-list/cityzen-restaurant-detail-outlet-list";
import { CityzenRestaurantDetailDisbursementList } from "./cityzen-restaurant-detail-disbursement-list/cityzen-restaurant-detail-disbursement-list";
import { CityzenRestaurantDetailCollectedCashList } from "./cityzen-restaurant-detail-collected-cash-list/cityzen-restaurant-detail-collected-cash-list";
import { CityzenRestaurantDetailPayoutMethodList } from "./cityzen-restaurant-detail-payout-method-list/cityzen-restaurant-detail-payout-method-list";
import { CityzenRestaurantDetailWithdrawalRequestList } from "./cityzen-restaurant-detail-withdrawal-request-list/cityzen-restaurant-detail-withdrawal-request-list";
import { CityzenRestaurantDetailWalletTransactions } from "./cityzen-restaurant-detail-wallet-transactions/cityzen-restaurant-detail-wallet-transactions";
import { CityzenRestaurantDetailReviews } from "./cityzen-restaurant-detail-reviews/cityzen-restaurant-detail-reviews";
import { CityzenRestaurantDetailMediaFiles } from "./cityzen-restaurant-detail-media-files/cityzen-restaurant-detail-media-files";

@Component({
  selector: 'app-cityzen-restaurant-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    CityzenRestaurantDetailInfo,
    CityzenRestaurantDetailOrderList,
    CityzenRestaurantDetailPosOrderList,
    CityzenRestaurantDetailTableOrderList,
    CityzenRestaurantDetailDiningList,
    CityzenRestaurantDetailFoodList,
    CityzenRestaurantDetailWaiterList,
    CityzenRestaurantDetailKitchenOwnerList,
    CityzenRestaurantDetailDeliverymanList,
    CityzenRestaurantDetailTiffinPackages,
    CityzenRestaurantDetailRefundRequestList,
    CityzenRestaurantDetailComplaintsList,
    CityzenRestaurantDetailOutletList,
    CityzenRestaurantDetailDisbursementList,
    CityzenRestaurantDetailCollectedCashList,
    CityzenRestaurantDetailPayoutMethodList,
    CityzenRestaurantDetailWithdrawalRequestList,
    CityzenRestaurantDetailWalletTransactions,
    CityzenRestaurantDetailReviews,
    CityzenRestaurantDetailMediaFiles,
  ],
  templateUrl: './cityzen-restaurant-detail.html',
})
export class CityzenRestaurantDetail {

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
