import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Dual-control forfeiture dialog. Collects the REQUESTER id + reason;
 * the approver is the signed-in admin, taken server-side from the
 * token. requester === approver is rejected by the API.
 */
@Component({
  selector: 'app-dialog-hold-forfeit',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-hold-forfeit.html',
})
export class DialogHoldForfeit {
  requestedBy: string = '';
  reason: string = '';
  isSaving: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogHoldForfeit>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.requestedBy || !this.reason) {
      return;
    }
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/holds/${this.data.row._id}/forfeit`, {
        requestedBy: this.requestedBy,
        reason: this.reason,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'update' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
