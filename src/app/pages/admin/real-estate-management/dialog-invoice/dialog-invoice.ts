import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Invoice review. Shows the frozen issue snapshot (amounts, rate,
 * HSN/SAC, GSTIN, place of supply, source link) and cancels via a
 * compensating credit note — never an edit. Cancellation needs the
 * settlement-manage right and a mandatory reason.
 */
@Component({
  selector: 'app-dialog-invoice',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-invoice.html',
})
export class DialogInvoice {
  isLoaded: boolean = false;
  isSaving: boolean = false;
  doc: any = null;
  reason: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogInvoice>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.api.get_private(`v1/realestate/admin/invoices/${this.data.invoiceId}`).subscribe({
      next: (response: any) => {
        this.doc = (response && response.data) || null;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  formatPaise(p: number): string {
    if (p === null || p === undefined) return '—';
    return '₹' + (Number(p) / 100).toLocaleString('en-IN');
  }

  canCancel(): boolean {
    return !!this.doc && this.doc.status === 'ISSUED' && this.util.hasRight('realestate.admin_settlement_manage');
  }

  onCancel() {
    if (this.isSaving || !this.reason.trim()) return;
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/invoices/${this.data.invoiceId}/cancel`, { reason: this.reason })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'decided' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  onClose() {
    this.dialogRef.close();
  }
}
