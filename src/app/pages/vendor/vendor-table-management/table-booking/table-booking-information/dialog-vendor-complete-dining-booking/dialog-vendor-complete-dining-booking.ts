import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-vendor-complete-dining-booking',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-vendor-complete-dining-booking.html',
})
export class DialogVendorCompleteDiningBooking {

  completeForm = new FormGroup({
    bookingId: new FormControl('', [Validators.required]),
    vendorId: new FormControl('', [Validators.required]),
    itemTotal: new FormControl(0, [Validators.required]),
    itemDiscount: new FormControl(0, [Validators.required]),
    couponDiscount: new FormControl(0, [Validators.required]),
    billTotal: new FormControl(0, [Validators.required]),
  });
  bookingId: string = '';
  userName: string = '';
  bookingDate: string = '';
  contactNumber: string = '';
  couponId: string = '';
  couponCode: string = '';
  couponDiscountType: string = 'percentage';
  couponMinDiscount: number = 0;
  couponMaxDiscount: number = 0;
  diningItemTotalAmount: number = 0;
  diningItemDiscountValue: number = 0;
  discountType: string = 'per';
  couponSelectedPercentageDiscount: number = 0;
  billTotal: number = 0;
  isSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogVendorCompleteDiningBooking>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.bookingId && this.data.bookingId !== null && this.data.bookingId !== '') {
      this.completeForm.controls['bookingId'].setValue(this.data.bookingId);
      this.completeForm.controls['vendorId'].setValue(this.util.getItem('_vendorId'));
      this.bookingId = this.data.bookingId;
      this.userName = this.data.userName;
      this.bookingDate = this.data.bookingDate;
      this.contactNumber = this.data.contactNumber;
      this.couponId = this.data.couponId;
      this.couponCode = this.data.couponCode;
      this.couponDiscountType = this.data.couponDiscountType;
      this.couponMinDiscount = this.data.couponMinDiscount;
      this.couponMaxDiscount = this.data.couponMaxDiscount;
      this.couponSelectedPercentageDiscount = this.couponMinDiscount;
    }
  }

  onSubmit() {
    console.log('submit');
    console.log(this.completeForm.getRawValue());
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/dining_booking/complete/', this.completeForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.dialogRef.close({ event: 'complete' });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onDiscountValueChange(event: MatButtonToggleChange) {
    console.log(event);
    this.couponSelectedPercentageDiscount = event.value;
    this.calculateBillingTotal();
  }

  onItemTotalChangeEvent(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue);
    if (filterValue != '') {
      this.diningItemTotalAmount = parseFloat(filterValue);
    } else {
      this.diningItemTotalAmount = 0;
    }
    this.calculateBillingTotal();
  }

  onDiscountChangeEvent(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue);
    if (filterValue != '') {
      this.diningItemDiscountValue = parseFloat(filterValue);
    } else {
      this.diningItemDiscountValue = 0;
    }
    this.calculateBillingTotal();
  }

  onDiscountTypeChangeEvent(event: MatSelectChange) {
    console.log(event);
    this.discountType = event.value;
    this.calculateBillingTotal();
  }

  calculateBillingTotal() {
    if (parseFloat(this.diningItemTotalAmount.toString()) > 0) {
      this.completeForm.controls['itemTotal'].setValue(this.diningItemTotalAmount);

      let discountAmount: number = 0;
      if (parseFloat(this.diningItemDiscountValue.toString()) > 0) {
        if (this.discountType == 'amount') {
          discountAmount = parseFloat(this.diningItemDiscountValue.toString());
        } else {
          function percentage(numFirst: number, per: number) {
            return (numFirst / 100) * per;
          }
          const discountString = (parseFloat(percentage(this.diningItemTotalAmount, this.diningItemDiscountValue).toString())).toFixed(2);
          discountAmount = parseFloat(discountString);
        }
      }

      let couponDiscountAmount: number = 0;
      if (this.couponId !== '') {
        if (this.couponDiscountType == 'amount') {
          couponDiscountAmount = parseFloat(this.couponSelectedPercentageDiscount.toString());
        } else {
          function percentage(numFirst: number, per: number) {
            return (numFirst / 100) * per;
          }
          const discountString = (parseFloat(percentage(this.diningItemTotalAmount, this.couponSelectedPercentageDiscount).toString())).toFixed(2);
          couponDiscountAmount = parseFloat(discountString);
        }
      }

      const totalDiscountString: string = (discountAmount + couponDiscountAmount).toFixed(2);
      const totalDiscount: number = parseFloat(totalDiscountString);

      const billingTotalString: string = (this.diningItemTotalAmount - totalDiscount).toFixed(2);
      const billingTotal: number = parseFloat(billingTotalString);
      this.billTotal = billingTotal;

      this.completeForm.controls['billTotal'].setValue(billingTotal);
      this.completeForm.controls['itemDiscount'].setValue(discountAmount);
      this.completeForm.controls['couponDiscount'].setValue(couponDiscountAmount);
    } else {
      this.billTotal = 0;
      this.completeForm.controls['itemTotal'].setValue(0);
      this.completeForm.controls['itemDiscount'].setValue(0);
      this.completeForm.controls['couponDiscount'].setValue(0);
      this.completeForm.controls['billTotal'].setValue(0);
    }
  }

}
