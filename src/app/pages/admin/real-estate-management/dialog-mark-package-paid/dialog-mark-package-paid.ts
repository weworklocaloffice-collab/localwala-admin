import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Explicit recovery for a listing package order whose gateway confirmation
 * was lost. The reason is mandatory (audited); the gateway reference is
 * optional because the operator may only have a bank statement reference.
 */
@Component({
  selector: 'app-dialog-mark-package-paid',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-mark-package-paid.html',
})
export class DialogMarkPackagePaid {
  isSaving: boolean = false;
  form: any = {
    reason: '',
    paymentRef: '',
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogMarkPackagePaid>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get canSubmit(): boolean {
    return !this.isSaving && String(this.form.reason || '').trim().length > 0;
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.canSubmit) return;
    this.isSaving = true;
    const id = this.data && (this.data.id || this.data._id);
    const body: any = { reason: String(this.form.reason).trim() };
    const paymentRef = String(this.form.paymentRef || '').trim();
    if (paymentRef) body.paymentRef = paymentRef;

    this.api
      .post_private(`v1/realestate/admin/package-payments/${id}/mark-paid`, body)
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'paid' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
