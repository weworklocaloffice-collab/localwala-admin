import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cancel-tiffin-subscription-refund-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cancel-tiffin-subscription-refund-request.html',
})
export class DialogCancelTiffinSubscriptionRefundRequest {

  id: string = '';
  cancelForm = new FormGroup({
    requestId: new FormControl('', [Validators.required]),
    cancelReason: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogCancelTiffinSubscriptionRefundRequest>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.requestId !== null && this.data.requestId != '') {
      this.id = this.data.requestId;
      this.cancelForm.controls['requestId'].setValue(this.data.requestId);
      console.log(`Request Id --> ${this.id}`);
    }
  }

  get f() {
    return this.cancelForm.controls;
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.cancelForm.valid) {
      console.log(this.cancelForm.value);
      this.isSubmit = true;
      this.api.post_private('v1/cityzen/tiffin_subscription_refund_request/cancel', this.cancelForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.success == true) {
            this.isSubmit = false
            this.util.onSuccess('ts_cancelled');
            this.dialogRef.close({ event: 'true' });
          }
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'cityzen');
        }
      });
    }
  }

}
