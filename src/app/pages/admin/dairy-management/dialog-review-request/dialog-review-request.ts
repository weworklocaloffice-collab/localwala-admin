import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-review-joining-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-review-request.html',
})
export class ReviewJoiningRequestDialog {
  row: any;
  approve: boolean = true;
  haveSubmitClicked: boolean = false;

  /**
   * The reason is required only when rejecting.
   *
   * A rejection is the one outcome the applicant has to act on, so it needs to say
   * why; an approval needs no justification to record.
   */
  reviewForm = new FormGroup({
    reason: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<ReviewJoiningRequestDialog>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
    this.approve = data.approve === true;
  }

  get f() {
    return this.reviewForm.controls;
  }

  /** The reason is only enforced on the path that needs it. */
  get reasonRequired(): boolean {
    return !this.approve && !String(this.f['reason'].value || '').trim();
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.reasonRequired) {
      return;
    }

    const body: any = { approve: this.approve };
    const reason = String(this.f['reason'].value || '').trim();
    if (reason) {
      body.reason = reason;
    }

    this.api
      .patch_private(
        'v1/dairy/joining_request/review/' + this.row._id + '/' + this.util.getItem('_uid'),
        body,
      )
      .subscribe({
        next: (response: any) => {
          this.dialogRef.close({ event: 'reviewed', data: response });
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
