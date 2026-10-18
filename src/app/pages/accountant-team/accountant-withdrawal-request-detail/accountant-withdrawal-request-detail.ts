import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { AccountantPayoutCredentialInterface } from 'src/app/interfaces/accountant.payout.credential.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ApproveWithdrawalRequestAccountantDialog } from './approve-withdrawal-request-accountant-dialog/approve-withdrawal-request-accountant-dialog';
import { DeclineWithdrawalRequestAccountantDialog } from './decline-withdrawal-request-accountant-dialog/decline-withdrawal-request-accountant-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-accountant-withdrawal-request-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './accountant-withdrawal-request-detail.html',
})
export class AccountantWithdrawalRequestDetail {

  credential: AccountantPayoutCredentialInterface[] = [];
  requestCredential: AccountantPayoutCredentialInterface[] = [];
  id: string = '';
  amount: number = 0;
  createdAt: string = '';
  from: string = '';
  proof: string = '';
  rejectedBy: string = '';
  rejectedReason: string = '';
  approvedNotes: string = '';
  restaurantName: string = '';
  restaurantAddress: string = '';
  restaurantLogo: string = '';
  restaurantCover: string = '';
  status: string = 'created';
  withdrawalMethodName: string = '';
  withdrawalMethodImage: string = '';
  restaurantOwnerName: string = '';
  restaurantOwnerMobile: string = '';
  restaurantOwnerEmail: string = '';
  restaurantRole: string = '';
  deliverymanName: string = '';
  deliverymanMobile: string = '';
  delivermanEmail: string = '';
  deliverymanImage: string = '';
  deliverymanRole: string = '';
  walletBalance: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != '') {
      this.getDetail();
    } else {
      this.onBack();
    }
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/accountant/withdrawal_request_detail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success == true && response.detail && response.detail.id) {
          const info = response.detail;
          this.amount = info.amount;
          this.createdAt = DateTime.fromISO(info.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
          this.from = info.from;
          this.proof = info.proof;
          this.rejectedBy = info.rejectedBy;
          this.rejectedReason = info.rejectedReason;
          this.approvedNotes = info.approvedNotes;
          this.status = info.status;
          this.requestCredential = info.formElement;
          if (info && info.from == 'restaurant' && info.restaurantInfo && info.restaurantInfo.name !== '') {
            const restaurantInfo = info.restaurantInfo;
            this.restaurantName = restaurantInfo.name;
            this.restaurantAddress = restaurantInfo.address;
            this.restaurantLogo = restaurantInfo.logo;
            this.restaurantCover = restaurantInfo.cover;
            this.restaurantRole = restaurantInfo.isOutlet == false ? this.util.appTranslate('restaurant') : this.util.appTranslate('outlet');

            if (info && info.restaurantInfo && info.restaurantInfo.translations && Array.isArray(info.restaurantInfo.translations)) {
              if (info.restaurantInfo.translations) {
                const translation = info.restaurantInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.restaurantName = translation?.title || info.restaurantInfo.name;
                this.restaurantAddress = translation?.address || info.restaurantInfo.address;
              }
            }
          }

          if (info && info.withdrawalMethodDetail && info.withdrawalMethodDetail.name != '') {
            const withdrawalMethodDetail = info.withdrawalMethodDetail;
            this.withdrawalMethodName = withdrawalMethodDetail.name;
            this.withdrawalMethodImage = withdrawalMethodDetail.image;

            if (info && info.withdrawalMethodDetail && info.withdrawalMethodDetail.translations && Array.isArray(info.withdrawalMethodDetail.translations)) {
              if (info.withdrawalMethodDetail.translations) {
                const translation = info.withdrawalMethodDetail.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.withdrawalMethodName = translation?.title || info.withdrawalMethodDetail.name;
              }
            }
          }

          if (info && info.restaurantPayoutMethodDetail && info.restaurantPayoutMethodDetail.id != '') {
            this.credential = info.restaurantPayoutMethodDetail.credential;
          }

          if (info && info.deliverymanPayoutMethodDetail && info.deliverymanPayoutMethodDetail.id != '') {
            this.credential = info.deliverymanPayoutMethodDetail.credential;
          }

          if (info && info.from == 'deliveryman' && info.deliverymanInfo && info.deliverymanInfo.id != '') {
            const deliverymanInfo = info.deliverymanInfo;
            this.deliverymanName = `${deliverymanInfo.firstName} ${deliverymanInfo.lastName}`;
            this.deliverymanMobile = `+${deliverymanInfo.countryCode} ${deliverymanInfo.contactNumber}`;
            this.delivermanEmail = deliverymanInfo.contactEmail;
            this.deliverymanRole = deliverymanInfo.role == 'driver' ? this.util.appTranslate('system_deliveryman') : this.util.appTranslate('vendor_deliveryman');
            this.deliverymanImage = deliverymanInfo.image;
          }
        }

        if (response && response.success == true && response.walletDetail && response.walletDetail.id != '') {
          this.walletBalance = response.walletDetail.balance;
        }

        if (response && response.success == true && response.detail && response.detail.from == 'restaurant' && response.restaurantOwner && response.restaurantOwner.id != '') {
          const ownerInfo = response.restaurantOwner;
          this.restaurantOwnerName = `${ownerInfo.firstName} ${ownerInfo.lastName}`;
          this.restaurantOwnerMobile = `+${ownerInfo.countryCode} ${ownerInfo.mobile}`;
          this.restaurantOwnerEmail = ownerInfo.email;
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'accountant');
      }
    });
  }

  onBack() {
    this.location.back();
  }

  onApproveRequest() {
    console.log('approve request');
    const dialogRef = this.dialog.open(ApproveWithdrawalRequestAccountantDialog, {
      data: { id: this.id, balance: this.walletBalance, amount: this.amount },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

  onDeclineRequest() {
    console.log('decline request');
    const dialogRef = this.dialog.open(DeclineWithdrawalRequestAccountantDialog, {
      data: { id: this.id, balance: this.walletBalance, amount: this.amount },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event === 'true') {
        this.onBack();
      }
    });
  }

}
