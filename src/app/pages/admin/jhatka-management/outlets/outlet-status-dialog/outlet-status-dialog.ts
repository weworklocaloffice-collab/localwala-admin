import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';

export interface OutletStatusDialogData {
  outletName: string;
  currentStatus: string;
  nextStatus: string;
  hasValidFssai?: boolean;
}

@Component({
  selector: 'app-outlet-status-dialog',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './outlet-status-dialog.html',
  styles: [
    `
      .status-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: grid;
        place-items: center;
      }
      .status-copy {
        line-height: 1.5;
      }
      .reason-field {
        width: 100%;
        margin-top: 12px;
      }
      .warning-box {
        border: 1px solid #f3d19e;
        background: #fff8e6;
        border-radius: 12px;
        padding: 12px 14px;
      }
    `,
  ],
})
export class OutletStatusDialog {
  reason = '';
  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OutletStatusDialogData,
    public dialogRef: MatDialogRef<OutletStatusDialog>,
    public util: UtilService,
  ) {}

  get requiresReason(): boolean {
    return this.data.nextStatus === 'suspended' || this.data.nextStatus === 'closed';
  }

  get isDestructive(): boolean {
    return this.data.nextStatus === 'suspended' || this.data.nextStatus === 'closed';
  }

  get needsFssaiWarning(): boolean {
    return this.data.nextStatus === 'active' && this.data.hasValidFssai === false;
  }

  get title(): string {
    const labels: Record<string, string> = {
      pending_approval: 'Submit outlet for approval',
      active: 'Activate outlet',
      suspended: 'Suspend outlet',
      closed: 'Close outlet',
      draft: 'Return outlet to draft',
    };
    return labels[this.data.nextStatus] || 'Change outlet status';
  }

  get description(): string {
    const labels: Record<string, string> = {
      pending_approval: 'The outlet will be sent for approval. It is not visible to customers until it is activated.',
      active: 'The outlet becomes visible to customers and can accept new orders.',
      suspended: 'Existing orders continue, but the outlet stops receiving new orders immediately.',
      closed: 'Closing is permanent for this record. The outlet cannot be reopened from this state.',
      draft: 'The outlet returns to draft and is removed from the approval queue.',
    };
    return labels[this.data.nextStatus] || '';
  }

  confirm() {
    if (this.requiresReason && !this.reason.trim()) {
      return;
    }
    this.dialogRef.close({
      status: this.data.nextStatus,
      statusReason: this.reason.trim() || undefined,
    });
  }
}
