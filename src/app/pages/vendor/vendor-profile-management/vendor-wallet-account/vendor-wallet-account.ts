import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';
import { WithdrawalRequest } from "./wallet-component/withdrawal-request/withdrawal-request";
import { WithdrawalHistory } from "./wallet-component/withdrawal-history/withdrawal-history";
import { TransactionHistory } from "./wallet-component/transaction-history/transaction-history";
import { PayoutAccounts } from "./wallet-component/payout-accounts/payout-accounts";
import { CashInHandHistory } from "./cash-in-hand-component/cash-in-hand-history/cash-in-hand-history";
import { SubmittedCashHistory } from "./cash-in-hand-component/submitted-cash-history/submitted-cash-history";
import { VendorPosTableOrderCommissionHistory } from "./cash-in-hand-component/vendor-pos-table-order-commission-history/vendor-pos-table-order-commission-history";

@Component({
  selector: 'app-vendor-wallet-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgIcon,
    WithdrawalRequest,
    WithdrawalHistory,
    TransactionHistory,
    PayoutAccounts,
    CashInHandHistory,
    SubmittedCashHistory,
    VendorPosTableOrderCommissionHistory
  ],
  templateUrl: './vendor-wallet-account.html',
})
export class VendorWalletAccount {

  inHandAmount: number = 0;
  totalEarning: number = 0;
  balance: number = 0;
  walletTabIndex: number = 0;
  cashInHandTabIndex: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getWalletInfo();
  }

  getWalletInfo() {
    this.api.get_private('v1/vendor_web/restaurant/wallet/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.walletInfo && response.walletInfo.id) {
          this.inHandAmount = response.inHandAmount;
          this.totalEarning = response.totalEarning;
          this.balance = response.walletInfo.balance;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  walletTabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.walletTabIndex = tabChangeEvent.index;
  }

  cashInHandTabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.cashInHandTabIndex = tabChangeEvent.index;
  }

}
