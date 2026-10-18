import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-outlet-terms',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-outlet-terms.html',
})
export class DialogOutletTerms {
  row: any;
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  /**
   * Commission and payout terms.
   *
   * Nothing here is `Validators.required` except the agreement start date: the API
   * accepts a partial update (`.min(1)` on the body), and a dialog that forced every
   * field would overwrite a bank detail the operator never meant to touch.
   */
  termsForm = new FormGroup({
    commissionPercentage: new FormControl(''),
    commissionBasis: new FormControl('product_only'),
    driverPayoutMode: new FormControl('platform_pays'),
    payoutMethod: new FormControl('wallet'),
    accountName: new FormControl(''),
    accountNumber: new FormControl(''),
    ifsc: new FormControl(''),
    upiId: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    minimumGuarantee: new FormControl(''),
    notes: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogOutletTerms>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
    const payout = this.row.payoutDetails || {};
    const agreement = this.row.agreement || {};

    this.termsForm.patchValue({
      commissionPercentage: this.row.commissionPercentage ?? '',
      commissionBasis: this.row.commissionBasis || 'product_only',
      driverPayoutMode: this.row.driverPayoutMode || 'platform_pays',
      payoutMethod: this.row.payoutMethod || 'wallet',
      accountName: payout.accountName || '',
      accountNumber: payout.accountNumber || '',
      ifsc: payout.ifsc || '',
      upiId: payout.upiId || '',
      startDate: agreement.startDate ? this.toDateInput(agreement.startDate) : '',
      endDate: agreement.endDate ? this.toDateInput(agreement.endDate) : '',
      minimumGuarantee: agreement.minimumGuarantee ?? '',
      notes: agreement.notes || '',
    });
  }

  get f() {
    return this.termsForm.controls;
  }

  /**
   * Whether the typed commission is outside 0-100.
   *
   * Checked here rather than in the template because the control holds a string (or
   * null) from an empty `<input type="number">`, and comparing that directly fails
   * to compile under `strictTemplates`. Empty is not out of range, so it passes.
   */
  get commissionOutOfRange(): boolean {
    const raw = this.f['commissionPercentage'].value;
    if (raw === '' || raw === null || raw === undefined) {
      return false;
    }
    const value = Number(raw);
    if (isNaN(value)) {
      return true;
    }
    return value < 0 || value > 100;
  }

  /** `datetime-local` wants `yyyy-MM-ddTHH:mm`, not an ISO string with a `Z`. */
  private toDateInput(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.isSubmit || this.commissionOutOfRange) {
      return;
    }
    this.isSubmit = true;

    const value: any = this.termsForm.value;
    const body: any = {};

    // Only fields the operator actually changed are sent, so an untouched dialog
    // cannot blank out a stored value.
    if (value.commissionPercentage !== '' && value.commissionPercentage !== null) {
      body.commissionPercentage = Number(value.commissionPercentage);
    }
    if (value.commissionBasis) {
      body.commissionBasis = value.commissionBasis;
    }
    if (value.driverPayoutMode) {
      body.driverPayoutMode = value.driverPayoutMode;
    }
    if (value.payoutMethod) {
      body.payoutMethod = value.payoutMethod;
    }

    const payoutDetails: any = {};
    for (const key of ['accountName', 'accountNumber', 'ifsc', 'upiId']) {
      if (value[key] !== '' && value[key] !== null) {
        payoutDetails[key] = value[key];
      }
    }
    if (Object.keys(payoutDetails).length) {
      body.payoutDetails = payoutDetails;
    }

    const agreement: any = {};
    if (value.startDate) {
      agreement.startDate = value.startDate;
    }
    if (value.endDate) {
      agreement.endDate = value.endDate;
    }
    if (value.minimumGuarantee !== '' && value.minimumGuarantee !== null) {
      agreement.minimumGuarantee = Number(value.minimumGuarantee);
    }
    if (value.notes) {
      agreement.notes = value.notes;
    }
    if (Object.keys(agreement).length) {
      body.agreement = agreement;
    }

    // `:partner` is the `DairyPartner` id, not the business id — `updatePartnerTerms`
    // does `DairyPartner.findById(partnerId)`. The list rows are partner documents,
    // so `row._id` is the right one.
    this.api.patch_private('v1/dairy/admin/partners/' + this.row._id, body).subscribe({
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
}
