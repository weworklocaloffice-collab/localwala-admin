import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-withdrawal-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-withdrawal-detail.html',
})
export class DialogWithdrawalDetail {

  amount: number = 0;
  approvedNotes: string = '';
  createdAt: string = '';
  id: string = '';
  proof: string = '';
  rejectedBy: string = '';
  rejectedReason: string = '';
  status: string = 'created';
  methodName: string = '';
  formElementCredential: PayoutCredentialInterface[] = [];
  restaurantPayoutMethodCredential: PayoutCredentialInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogWithdrawalDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.info && this.data.info.id) {
      const info = this.data.info;
      console.log(info);
      this.amount = info.amount;
      this.approvedNotes = info.approvedNotes;
      this.createdAt = DateTime.fromISO(info.createdAt).setLocale(this.util.appLocaleName()).toFormat('MMMM dd, yyyy');
      this.formElementCredential = info.formElement;
      this.id = info.id;
      this.proof = info.proof;
      this.rejectedBy = info.rejectedBy;
      this.rejectedReason = info.rejectedReason;
      this.restaurantPayoutMethodCredential = info.restaurantPayoutMethodDetail.credential;
      this.status = info.status;
      this.methodName = info.withdrawalMethodDetail.name;

      if (info && info.withdrawalMethodDetail && info.withdrawalMethodDetail.translations && Array.isArray(info.withdrawalMethodDetail.translations)) {
        if (info.withdrawalMethodDetail.translations) {
          const translation = info.withdrawalMethodDetail.translations.find((t: any) => t.code == this.util.appLocaleName());
          this.methodName = translation?.title || info.withdrawalMethodDetail.name;
        }
      }
    } else {
      this.util.onError('ts_something_went_wrong', '');
      this.dialogRef.close();
    }
  }
}

export interface PayoutCredentialInterface {
  fieldName: string
  fieldType: string
  fieldValue: string
}

