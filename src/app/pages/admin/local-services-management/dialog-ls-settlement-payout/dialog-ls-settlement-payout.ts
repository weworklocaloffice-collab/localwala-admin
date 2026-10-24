import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-settlement-payout',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-ls-settlement-payout.html',
})
export class DialogLsSettlementPayout {
  method: 'wallet' | 'bank' = 'wallet';
  reference: string = '';
  note: string = '';
  accountName: string = '';
  accountNumber: string = '';
  ifsc: string = '';
  upiId: string = '';
  submitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogLsSettlementPayout>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public api: ApiService,
    public util: UtilService,
  ) {}

  onSubmit() {
    if (this.method === 'bank' && !this.reference.trim()) {
      this.util.handleError({ error: { message: 'A payout reference is required for a bank payout' } }, 'admin');
      return;
    }
    this.submitting = true;
    this.api
      .post_private('v1/local-services/admin/revenue/settlements/' + this.data.id + '/pay', {
        method: this.method,
        reference: this.reference.trim() || null,
        note: this.note.trim() || null,
        account: {
          accountName: this.accountName.trim() || null,
          accountNumber: this.accountNumber.trim() || null,
          ifsc: this.ifsc.trim() || null,
          upiId: this.upiId.trim() || null,
        },
      })
      .subscribe({
        next: (response: any) => {
          this.submitting = false;
          this.util.onSuccess('ts_status_updated');
          this.dialogRef.close({ event: 'update', data: response });
        },
        error: (error: any) => {
          this.submitting = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
