import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-settlement-pay',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-settlement-pay.html',
})
export class DialogSettlementPay {
  row: any;
  isSubmit: boolean = false;

  payForm = new FormGroup({
    reference: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogSettlementPay>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
  }

  get f() {
    return this.payForm.controls;
  }

  onConfirm() {
    if (this.isSubmit) {
      return;
    }
    this.isSubmit = true;

    const body: any = {};
    const reference = String(this.f['reference'].value || '').trim();
    if (reference) {
      body.reference = reference;
    }

    // Payout is `POST /settlements/:settlement/pay`, not a status patch. `paid` is
    // deliberately absent from the PATCH route's allowed statuses, because paying
    // moves money and is not just a state change.
    this.api.post_private('v1/dairy/settlements/' + this.row._id + '/pay', body).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
