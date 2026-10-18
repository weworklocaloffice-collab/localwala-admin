import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { DriverDetailsPersonalInfo } from "./driver-details-personal-info/driver-details-personal-info";
import { DriverDetailsOrderList } from "./driver-details-order-list/driver-details-order-list";
import { DriverDetailsComplaints } from "./driver-details-complaints/driver-details-complaints";
import { DriverDetailsDisbursement } from "./driver-details-disbursement/driver-details-disbursement";
import { DriverDetailsCollectedCash } from "./driver-details-collected-cash/driver-details-collected-cash";
import { DriverDetailsPayoutAccounts } from "./driver-details-payout-accounts/driver-details-payout-accounts";
import { DriverDetailsWithdrawalRequest } from "./driver-details-withdrawal-request/driver-details-withdrawal-request";
import { DriverDetailsWalletTransactions } from "./driver-details-wallet-transactions/driver-details-wallet-transactions";
import { DriverDetailsReviews } from "./driver-details-reviews/driver-details-reviews";
import { DriverDetailsMedias } from "./driver-details-medias/driver-details-medias";

@Component({
  selector: 'app-driver-details',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    DriverDetailsPersonalInfo,
    DriverDetailsOrderList,
    DriverDetailsComplaints,
    DriverDetailsDisbursement,
    DriverDetailsCollectedCash,
    DriverDetailsPayoutAccounts,
    DriverDetailsWithdrawalRequest,
    DriverDetailsWalletTransactions,
    DriverDetailsReviews,
    DriverDetailsMedias,
  ],
  templateUrl: './driver-details.html',
})
export class DriverDetails {

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
