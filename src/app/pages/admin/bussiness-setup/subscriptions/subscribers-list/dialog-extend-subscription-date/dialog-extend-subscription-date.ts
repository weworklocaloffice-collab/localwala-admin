import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-extend-subscription-date',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-extend-subscription-date.html',
})
export class DialogExtendSubscriptionDate {

  subscriptionForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  isTrialPackage: boolean = false;
  currentStartDate: string = '';
  currentEndDate: string = '';
  restaurantName: string = '';
  subscriptionName: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogExtendSubscriptionDate>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id) {
      this.subscriptionForm.controls['id'].setValue(this.data.id);
      this.restaurantName = this.data.restaurant;
      this.subscriptionName = this.data.subscription;
      if (this.data && this.data.startDate && this.data.startDate != null && this.data.startDate != '') {
        this.currentStartDate = DateTime.fromISO(this.data.startDate).toFormat('dd LLL yyyy');
        this.currentEndDate = DateTime.fromISO(this.data.endDate).toFormat('dd LLL yyyy');
        this.isTrialPackage = false;
      } else if (this.data && this.data.trialStartDate && this.data.trialStartDate != null && this.data.trialStartDate != '') {
        this.currentStartDate = DateTime.fromISO(this.data.trialStartDate).toFormat('dd LLL yyyy');
        this.currentEndDate = DateTime.fromISO(this.data.trialEndDate).toFormat('dd LLL yyyy');
        this.isTrialPackage = true;
      }
    }
  }

  get f() {
    return this.subscriptionForm.controls;
  }

  onSubmit() {
    console.log('Submit', this.subscriptionForm);
    this.isSubmit = true;
    this.api.post_private('v1/admin/subscriber/extend_dates/', this.subscriptionForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_date_extended');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        console.log(error);
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

}
