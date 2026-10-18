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
  selector: 'app-dialog-outlet-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-outlet-status.html',
})
export class DialogOutletStatus {
  row: any;
  status: string = 'suspended';
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  /**
   * A reason is required to suspend or terminate, and optional to reactivate.
   *
   * The same reasoning as rejecting an application: an operator needs to record why
   * an outlet stopped trading, whereas putting one back needs no justification.
   */
  statusForm = new FormGroup({
    reason: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogOutletStatus>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
    this.status = data.status;
  }

  get f() {
    return this.statusForm.controls;
  }

  get isReactivating(): boolean {
    return this.status === 'active';
  }

  get reasonRequired(): boolean {
    return !this.isReactivating && !String(this.f['reason'].value || '').trim();
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.reasonRequired || this.isSubmit) {
      return;
    }
    this.isSubmit = true;

    const body: any = {};
    const reason = String(this.f['reason'].value || '').trim();
    if (reason) {
      body.reason = reason;
    }

    this.api
      .patch_private('v1/dairy/admin/partners/' + this.row._id + '/' + this.status, body)
      .subscribe({
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
