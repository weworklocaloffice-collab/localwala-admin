import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Custody statement review. Shows the match outcome — twins found,
 * statement rows with no ledger twin, ledger entries with no
 * statement twin — and runs the match while PENDING. Unmatched lines
 * on either side are for a human to clear, never auto-resolved.
 */
@Component({
  selector: 'app-dialog-custody-statement',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-custody-statement.html',
})
export class DialogCustodyStatement {
  isLoaded: boolean = false;
  isMatching: boolean = false;
  doc: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogCustodyStatement>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.api.get_private(`v1/realestate/admin/custody-statements/${this.data.statementId}`).subscribe({
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

  get match(): any {
    return (this.doc && this.doc.match) || {};
  }

  get rows(): any[] {
    return (this.doc && this.doc.rows) || [];
  }

  unmatchedRow(i: number): any {
    return this.rows[i] || {};
  }

  formatPaise(p: number): string {
    if (p === null || p === undefined) return '—';
    return '₹' + (Number(p) / 100).toLocaleString('en-IN');
  }

  onMatch() {
    if (this.isMatching) return;
    this.isMatching = true;
    this.api.post_private(`v1/realestate/admin/custody-statements/${this.data.statementId}/match`, {}).subscribe({
      next: () => {
        this.isMatching = false;
        this.load();
      },
      error: (error: any) => {
        this.isMatching = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
