import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-give-dining-booking-refund-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-give-dining-booking-refund-request.html',
})
export class DialogCityzenGiveDiningBookingRefundRequest {

  bookingId: string = '';
  payment: string = '';
  paymentMode: string = '';
  requestId: string = '';
  grandTotal: number = 0;
  refundForm = new FormGroup({
    bookingId: new FormControl('', [Validators.required]),
    requestId: new FormControl('', [Validators.required]),
    refundTo: new FormControl('wallet', [Validators.required]),
    refundType: new FormControl('partial', [Validators.required]),
    refundAmount: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogCityzenGiveDiningBookingRefundRequest>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.requestId !== null && this.data.requestId != '') {
      this.grandTotal = this.data.grandTotal;
      this.bookingId = this.data.bookingId;
      this.payment = this.data.payment;
      this.paymentMode = this.data.paymentMode;
      this.requestId = this.data.requestId;
      console.log(`Grand Total --> ${this.grandTotal}`);
      console.log(`Booking Id --> ${this.bookingId}`);
      console.log(`Payment --> ${this.payment}`);
      console.log(`Payment Mode --> ${this.paymentMode}`);
      console.log(`Request Id --> ${this.requestId}`);
      this.refundForm.controls['requestId'].setValue(this.data.requestId);
      this.refundForm.controls['bookingId'].setValue(this.data.bookingId);
      if (this.paymentMode == 'offline') {
        this.refundForm.controls['refundTo'].setValue('wallet');
        this.refundForm.controls['refundTo'].disable();
      }
    }
  }

  get f() {
    return this.refundForm.controls;
  }

  onRefundTypeChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'full') {
      this.refundForm.controls['refundAmount'].clearValidators();
      this.refundForm.controls['refundAmount'].disable();
    } else {
      this.refundForm.controls['refundAmount'].setValidators([Validators.required]);
      this.refundForm.controls['refundAmount'].enable();
      this.refundForm.controls['refundAmount'].setValue('');
    }

  }

  onRefundFromMerchant() {
    console.log('Refund from Merchant');
    this.isSubmit = true;
    this.api.post_private('v1/cityzen/dining_booking_refund_request/refundFromMerchant', { requestId: this.requestId }).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success == true) {
          this.isSubmit = false
          this.util.onSuccess('ts_refund_process_completed');
          this.dialogRef.close({ event: 'true' });
        }
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.refundForm.valid) {
      console.log(this.refundForm.getRawValue());
      const refundedAmount = this.refundForm.controls['refundAmount'].value != null && this.refundForm.controls['refundAmount'].value != '' ? parseFloat(this.refundForm.controls['refundAmount'].value) : 0;
      console.log(`Refunded Amount --> ${refundedAmount}`);
      if (refundedAmount <= this.grandTotal) {
        console.log('All OK');
        this.isSubmit = true;
        this.api.post_private('v1/cityzen/dining_booking_refund_request/approve', this.refundForm.getRawValue()).subscribe({
          next: (response: any) => {
            console.log(response);
            if (response && response.success == true) {
              this.isSubmit = false
              this.util.onSuccess('ts_refund_process_completed');
              this.dialogRef.close({ event: 'true' });
            }
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'cityzen');
          }
        });
      } else {
        console.log('NOT OK');
        this.util.onError('ts_refund_amount_is_invalid', '');
      }
    }
  }

}
