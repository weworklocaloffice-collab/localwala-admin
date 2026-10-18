import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { AdminPayoutCredentialInterface } from 'src/app/interfaces/admin.payout.credential.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-deliveryman-disbursement-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-deliveryman-disbursement-detail.html',
})
export class DialogDeliverymanDisbursementDetail {

  id: string = '';
  createdAt: string = '';
  status: string = 'created';
  payoutMethodName: string = '';
  deliverymanName: string = '';
  deliverymanRole: string = '';
  deliverymanEmail: string = '';
  deliverymanMobile: string = '';
  disbursementAmount: number = 0;
  payoutCredential: AdminPayoutCredentialInterface[] = [];
  isSubmit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogDeliverymanDisbursementDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id !== null && this.data.id != '') {
      this.id = this.data.id;
      this.getDetail();
    } else {
      this.dialogRef.close({ event: 'false' });
    }
  }

  getDetail() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement/deliverymanDisbursementDetail/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success && response.detail && response.detail.id) {
          const detail = response.detail;
          this.createdAt = DateTime.fromISO(detail.createdAt).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
          this.status = detail.status;


          this.deliverymanName = `${detail.driverInfo.firstName} ${detail.driverInfo.lastName}`;
          this.deliverymanRole = detail.driverInfo.role;
          this.deliverymanEmail = detail.driverInfo.contactEmail;
          this.deliverymanMobile = `+${detail.driverInfo.countryCode} ${detail.driverInfo.contactNumber}`;

          this.disbursementAmount = detail.amount;

          if (detail.status == 'created') {
            this.payoutMethodName = detail.defaultPayoutMethodDetailInfo.name;
            this.payoutCredential = detail.defaultPayoutMethodDetail.credential;

            if (detail && detail.defaultPayoutMethodDetailInfo && detail.defaultPayoutMethodDetailInfo.translations && Array.isArray(detail.defaultPayoutMethodDetailInfo.translations)) {
              if (detail.defaultPayoutMethodDetailInfo.translations) {
                const translation = detail.defaultPayoutMethodDetailInfo.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.payoutMethodName = translation?.title || detail.defaultPayoutMethodDetailInfo.name;
              }
            }
          } else {
            this.payoutMethodName = detail.withdrawalMethodDetail.name;
            this.payoutCredential = detail.deliverymanPayoutMethodDetail.credential;

            if (detail && detail.withdrawalMethodDetail && detail.withdrawalMethodDetail.translations && Array.isArray(detail.withdrawalMethodDetail.translations)) {
              if (detail.withdrawalMethodDetail.translations) {
                const translation = detail.withdrawalMethodDetail.translations.find((t: any) => t.code == this.util.appLocaleName());
                this.payoutMethodName = translation?.title || detail.withdrawalMethodDetail.name;
              }
            }
          }
        } else {
          this.util.onError('ts_invalid_information', '');
          this.dialogRef.close({ event: 'false' });
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onAccept() {
    console.log('Accept');
    this.isSubmit = true;
    this.api.get_private('v1/admin/disbursement/acceptDeliverymanDisbursement/' + this.id).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success == true) {
          this.isSubmit = false
          this.util.onSuccess('ts_accepted');
          this.dialogRef.close({ event: 'true' });
        }
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

}
