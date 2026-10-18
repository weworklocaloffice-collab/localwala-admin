import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-dialog-verify-order-pin',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgOtpInputModule],
  templateUrl: './dialog-verify-order-pin.html',
})
export class DialogVerifyOrderPin {

  id: string = '';
  customerPin: string = '';
  deliveryType: string = '';
  driverPin: string = '';
  grandTotal: number = 0;
  paymentMode: string = '';
  otpLength: number = 0;
  collectAmount: boolean = false;
  savedOTP: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogVerifyOrderPin>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.paymentMode) {
      this.customerPin = this.data.customerPin;
      this.deliveryType = this.data.deliveryType;
      this.driverPin = this.data.driverPin;
      this.grandTotal = this.data.grandTotal;
      this.paymentMode = this.data.paymentMode;
      this.otpLength = this.customerPin.length;
    }
  }

  onOtpChange(event: any) {
    console.log(event);
    this.savedOTP = event;
  }

  onClose() {
    console.log('on Close');
    console.log(this.deliveryType);
    console.log(this.collectAmount);
    console.log(this.savedOTP);
    if (this.deliveryType == 'selfpickup' && this.collectAmount == false && this.paymentMode == 'offline') {
      this.util.onError('ts_please_collect_cash', '');
      return;
    }
    if (this.savedOTP != '' && this.savedOTP.length != this.customerPin.length) {
      this.util.onError('ts_wrong_otp', '');
      return;
    }
    const checkOTP = this.deliveryType == 'homedelivery' ? this.driverPin : this.customerPin;
    if (this.savedOTP == checkOTP) {
      console.log('OKK');
      this.dialogRef.close({ 'success': true });
    } else {
      this.util.onError('ts_wrong_otp', '');
    }
  }

}
