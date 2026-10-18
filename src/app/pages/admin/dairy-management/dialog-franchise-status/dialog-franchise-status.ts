import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-franchise-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-franchise-status.html',
})
export class DialogFranchiseStatus {
  row: any;
  status: string = '';
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  statusForm = new FormGroup({
    reason: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogFranchiseStatus>,
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

  /**
   * Terminating needs a reason; suspending, expiring and reactivating do not.
   *
   * The API accepts an empty reason for all of them, so this is the screen's
   * choice — a terminated agreement is the one an operator will be asked to explain
   * later.
   */
  get reasonRequired(): boolean {
    return this.status === 'terminated' && !String(this.f['reason'].value || '').trim();
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
      .patch_private('v1/dairy/admin/franchises/' + this.row._id + '/' + this.status, body)
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
