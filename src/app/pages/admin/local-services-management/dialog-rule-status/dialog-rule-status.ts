import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-rule-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-rule-status.html',
})
export class DialogRuleStatus {
  row: any;
  status: string = 'active';
  isSubmit: boolean = false;

  statusForm = new FormGroup({ note: new FormControl('') });

  constructor(
    public dialogRef: MatDialogRef<DialogRuleStatus>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
    this.status = data.status;
  }

  get needsNote(): boolean {
    return this.status === 'approved' && !String(this.statusForm.value.note || '').trim();
  }

  onConfirm() {
    if (this.needsNote || this.isSubmit) return;
    this.isSubmit = true;
    const body: any = {};
    const note = String(this.statusForm.value.note || '').trim();
    if (note) {
      body.approvalNote = note;
      body.reason = note;
    }
    this.api.post_private('v1/local-services/admin/revenue/rules/' + this.row._id + '/' + this.status, body).subscribe({
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
