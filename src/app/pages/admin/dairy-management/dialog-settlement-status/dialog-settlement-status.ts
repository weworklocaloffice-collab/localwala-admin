import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-settlement-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-settlement-status.html',
})
export class DialogSettlementStatus {
  row: any;
  status: string = '';
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  statusForm = new FormGroup({
    reason: new FormControl(''),
    notes: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogSettlementStatus>,
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
   * Voiding writes off a financial statement, so it carries a reason.
   *
   * The API would accept an empty one — this is the screen's choice, not a
   * technical limit. Approving and returning to draft do not ask for one.
   */
  get reasonRequired(): boolean {
    return this.status === 'void' && !String(this.f['reason'].value || '').trim();
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.reasonRequired || this.isSubmit) {
      return;
    }
    this.isSubmit = true;

    const body: any = {};
    const reason = String(this.f['reason'].value || '').trim();
    const notes = String(this.f['notes'].value || '').trim();
    if (reason) {
      body.reason = reason;
    }
    if (notes) {
      body.notes = notes;
    }

    this.api
      .patch_private('v1/dairy/settlements/' + this.status + '/' + this.row._id, body)
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
