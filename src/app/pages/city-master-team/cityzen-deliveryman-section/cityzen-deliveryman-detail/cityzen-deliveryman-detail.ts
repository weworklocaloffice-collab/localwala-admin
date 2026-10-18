import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { CityzenDeliverymanDetailPersonalInfo } from "./cityzen-deliveryman-detail-personal-info/cityzen-deliveryman-detail-personal-info";
import { CityzenDeliverymanDetailOrderList } from "./cityzen-deliveryman-detail-order-list/cityzen-deliveryman-detail-order-list";
import { CityzenDeliverymanDetailComplaints } from "./cityzen-deliveryman-detail-complaints/cityzen-deliveryman-detail-complaints";
import { CityzenDeliverymanDetailDisbursement } from "./cityzen-deliveryman-detail-disbursement/cityzen-deliveryman-detail-disbursement";
import { CityzenDeliverymanDetailCollectedCash } from "./cityzen-deliveryman-detail-collected-cash/cityzen-deliveryman-detail-collected-cash";
import { CityzenDeliverymanDetailPayoutAccounts } from "./cityzen-deliveryman-detail-payout-accounts/cityzen-deliveryman-detail-payout-accounts";
import { CityzenDeliverymanDetailWithdrawalRequest } from "./cityzen-deliveryman-detail-withdrawal-request/cityzen-deliveryman-detail-withdrawal-request";
import { CityzenDeliverymanDetailWalletTransactions } from "./cityzen-deliveryman-detail-wallet-transactions/cityzen-deliveryman-detail-wallet-transactions";
import { CityzenDeliverymanDetailReviews } from "./cityzen-deliveryman-detail-reviews/cityzen-deliveryman-detail-reviews";
import { CityzenDeliverymanDetailMedias } from "./cityzen-deliveryman-detail-medias/cityzen-deliveryman-detail-medias";

@Component({
  selector: 'app-cityzen-deliveryman-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    CityzenDeliverymanDetailPersonalInfo,
    CityzenDeliverymanDetailOrderList,
    CityzenDeliverymanDetailComplaints,
    CityzenDeliverymanDetailDisbursement,
    CityzenDeliverymanDetailCollectedCash,
    CityzenDeliverymanDetailPayoutAccounts,
    CityzenDeliverymanDetailWithdrawalRequest,
    CityzenDeliverymanDetailWalletTransactions,
    CityzenDeliverymanDetailReviews,
    CityzenDeliverymanDetailMedias,
  ],
  templateUrl: './cityzen-deliveryman-detail.html',
})
export class CityzenDeliverymanDetail {

  driverId: string = '';
  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.driverId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.driverId);
    if (this.driverId == '') {
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
