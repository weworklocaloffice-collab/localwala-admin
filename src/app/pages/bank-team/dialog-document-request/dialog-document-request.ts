import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';

/**
 * The document categories a bank may ask for.
 *
 * A closed list, not a free-text field: the same list the API accepts
 * (`DOCUMENT_REQUEST_CATEGORIES` in `realestate.bank.validation.js`).
 * A free-text category would produce "Salary Slip" and "salary slip" as
 * two different asks, and the customer's request list could not be
 * grouped or filtered.
 */
export const DOCUMENT_REQUEST_CATEGORIES = [
  'AADHAAR',
  'PAN',
  'SALARY_SLIP',
  'SELF_EMPLOYED_INCOME',
  'BANK_STATEMENT',
  'KYC',
  'CREDIT_REPORT',
  'CERTIFICATE',
  'OTHER',
];

/**
 * Document-request dialog — the bank asks the customer for a document.
 *
 * The POST happens in the caller (application-detail), so this dialog
 * stays a pure input surface like the sanction / reject / disburse
 * dialogs: it collects the ask and hands it back.
 */
@Component({
  selector: 'app-dialog-document-request',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-document-request.html',
})
export class DialogDocumentRequest {
  categories = DOCUMENT_REQUEST_CATEGORIES;
  category: string = 'AADHAAR';
  title: string = '';
  notes: string = '';
  dueDate: string = '';

  constructor(
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogDocumentRequest>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: string; title?: string },
  ) {
    this.category = data?.category || 'AADHAAR';
    this.title = data?.title || '';
  }

  onClose() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (!this.title || !this.title.trim()) return;
    this.dialogRef.close({
      event: 'confirmed',
      category: this.category,
      title: this.title.trim(),
      notes: (this.notes || '').trim(),
      dueDate: this.dueDate || null,
    });
  }
}
