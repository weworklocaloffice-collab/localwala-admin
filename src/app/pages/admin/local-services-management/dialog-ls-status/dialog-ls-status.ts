import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-status.html',
})
export class DialogLsStatus {
  apiPath: string = '';
  row: any;
  status: string = '';
  isSubmit: boolean = false;

  statusForm = new FormGroup({ note: new FormControl('') });

  constructor(
    public dialogRef: MatDialogRef<DialogLsStatus>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.apiPath = data.apiPath;
    this.row = data.row;
    this.status = data.status;
  }

  onConfirm() {
    if (this.isSubmit) return;
    this.isSubmit = true;
    const note = String(this.statusForm.value.note || '').trim();
    // Two backend styles: transition POST :id/:status (rules/providers/offerings)
    // vs PATCH :id {status} (catalog taxonomy). Chosen by data.mode.
    if (this.data.mode === 'patch-status') {
      this.api.patch_private(this.data.apiPath + this.row._id, { status: this.status }).subscribe({
        next: (response: any) => {
          this.isSubmit = false;
          this.dialogRef.close({ event: 'update', data: response });
        },
        error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }
    const body: any = {};
    if (note) {
      body.reason = note;
      body.approvalNote = note;
    }
    this.api.post_private(this.apiPath + this.row._id + '/' + this.status, body).subscribe({
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
