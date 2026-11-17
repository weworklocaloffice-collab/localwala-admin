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
  reasonError: boolean = false;

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

  get isProvider(): boolean {
    return !!(this.row && this.row.businessName);
  }

  get isReject(): boolean {
    return this.status === 'REJECTED';
  }

  get ownerName(): string {
    const owner = this.row?.owner;
    if (!owner || typeof owner !== 'object') return '';
    return [owner.firstName, owner.lastName].filter(Boolean).join(' ');
  }

  get ownerEmail(): string {
    const owner = this.row?.owner;
    return owner && typeof owner === 'object' ? owner.email || '' : '';
  }

  get ownerPhone(): string {
    const owner = this.row?.owner;
    if (!owner || typeof owner !== 'object') return '';
    return [owner.countryCode, owner.mobile].filter(Boolean).join(' ');
  }

  get serviceList(): string {
    return Array.isArray(this.row?.serviceKeys) ? this.row.serviceKeys.join(', ') : '';
  }

  get docSummary(): string {
    const counts = this.row?.docCounts;
    if (!counts) return '';
    return `${counts.pending || 0} pending, ${counts.verified || 0} verified, ${counts.rejected || 0} rejected`;
  }

  onConfirm() {
    if (this.isSubmit) return;
    const note = String(this.statusForm.value.note || '').trim();
    if (this.isReject && !note) {
      this.reasonError = true;
      return;
    }
    this.isSubmit = true;
    const rowId = this.row.id || this.row._id;
    // Two backend styles: transition POST :id/:status (rules/providers/offerings)
    // vs PATCH :id {status} (catalog taxonomy). Chosen by data.mode.
    if (this.data.mode === 'patch-status') {
      this.api.patch_private(this.data.apiPath + rowId, { status: this.status }).subscribe({
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
      body.note = note;
    }
    this.api.post_private(this.apiPath + rowId + '/' + this.status, body).subscribe({
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
