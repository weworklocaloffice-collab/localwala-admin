import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VendorWithdrawalPayoutMethodInterface } from 'src/app/interfaces/vendor.withdrawal.payout.method.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogVendorPayoutAccount } from '../payout-accounts/dialog-vendor-payout-account/dialog-vendor-payout-account';
import { MatSelectChange } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-withdrawal-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './withdrawal-request.html',
})
export class WithdrawalRequest {

  isLoaded: boolean = false;
  balance: number = 0;
  methods: VendorWithdrawalPayoutMethodInterface[] = [];
  selectedMethod: string = '';
  amount: string = '';
  credential: MethodFormCredentialElement[] = [];
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
  ) {
    this.getDetail();
  }

  getDetail() {
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/wallet/withdrawalDetail/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        console.log(response);
        if (response && response.success && response.walletInfo && response.walletInfo.id) {
          this.balance = response.walletInfo.balance;
        }
        if (response && response.methods && response.methods.length) {
          const mappedList = response.methods.map(
            (item: VendorWithdrawalPayoutMethodInterface) => {
              if (item && item.method && item.method?.id) {
                if (item.method?.translations) {
                  const translation = item.method.translations.find((t) => t.code == this.util.appLocaleName());
                  item.method.displayName = translation?.title || item.method.name;
                } else {
                  item.method.displayName = item.method?.name || '';
                }
              }
              return item;
            }
          );
          this.methods = mappedList;
          this.selectedMethod = this.methods[0].id;
          this.credential = this.methods[0].formElement;
          console.log(this.methods);
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddMethod() {
    const dialogRef = this.dialog.open(DialogVendorPayoutAccount, {
      data: { action: 'add' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event == 'update') {
        this.getDetail();
      }
    });
  }

  onMethodChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event.value != '') {
      const indexOfMethodId = this.methods.findIndex((x) => x.id == event.value);
      console.log(indexOfMethodId);
      if (indexOfMethodId != -1) {
        this.credential = this.methods[indexOfMethodId].formElement;
      }
    }
  }

  onWithdrawalEvent() {
    console.log(this.haveSubmitClicked);
    this.haveSubmitClicked = true;
    if (this.amount != '') {
      const amount = parseFloat(this.amount);
      if (amount <= this.balance) {
        const indexOfMethodId = this.methods.findIndex((x) => x.id == this.selectedMethod);
        if (indexOfMethodId != -1) {
          const withdrawalMethod = this.methods[indexOfMethodId].method.id;
          console.log(withdrawalMethod);
          const param = {
            'restaurant': this.util.getItem('_vendorId'),
            'restaurantPayoutMethod': this.selectedMethod,
            'withdrawalMethod': withdrawalMethod,
            'amount': amount
          };
          console.log(param);
          this.isSubmit = true;
          this.api.post_private('v1/vendor_web/wallet/requestWithdrawal/', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.isSubmit = false;
              this.util.onSuccess('ts_request_sent');
            }, error: (error: any) => {
              console.log(error);
              this.isSubmit = false;
              this.util.handleError(error, 'vendor');
            }
          });
        } else {
          this.util.onError('ts_something_went_wrong', '');
        }
      } else {
        this.util.onError('ts_insufficient_funds', '');
      }
    }
  }
}

export interface MethodFormCredentialElement {
  fieldName: string
  fieldType: string
  fieldValue: string
}

