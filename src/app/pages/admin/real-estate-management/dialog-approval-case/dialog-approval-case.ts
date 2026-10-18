import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

interface DiffRow {
  path: string;
  before: string;
  after: string;
}

/**
 * Approval case review. Renders the frozen before/after diff the
 * approver actually decides on (never the live document), the evidence
 * trail, and decide/comment actions. SoD failures surface from the
 * server verbatim — e.g. a requester approving their own case.
 */
@Component({
  selector: 'app-dialog-approval-case',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-approval-case.html',
})
export class DialogApprovalCase {
  isSaving: boolean = false;
  note: string = '';
  approvalReference: string = '';
  commentText: string = '';
  diff: DiffRow[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogApprovalCase>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.diff = DialogApprovalCase.diffOf(data?.case?.diffBefore || {}, data?.case?.diffAfter || {});
  }

  get kase(): any {
    return this.data?.case || {};
  }

  get isOpen(): boolean {
    return this.kase.status === 'REQUESTED';
  }

  canApprove(): boolean {
    return this.isOpen && this.util.hasRight('realestate.admin_hold_policy_approve');
  }

  canManage(): boolean {
    return this.util.hasRight('realestate.admin_manage_listings');
  }

  static fmt(v: any): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') {
      try {
        const s = JSON.stringify(v);
        return s.length > 120 ? s.slice(0, 120) + '…' : s;
      } catch {
        return String(v);
      }
    }
    return String(v);
  }

  static flatten(obj: any, prefix: string, out: Map<string, string>) {
    if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
      out.set(prefix, DialogApprovalCase.fmt(obj));
      return;
    }
    for (const k of Object.keys(obj)) {
      if (['_id', '__v', 'createdAt', 'updatedAt'].includes(k)) continue;
      DialogApprovalCase.flatten(obj[k], prefix ? `${prefix}.${k}` : k, out);
    }
  }

  static diffOf(before: any, after: any): DiffRow[] {
    const b = new Map<string, string>();
    const a = new Map<string, string>();
    DialogApprovalCase.flatten(before, '', b);
    DialogApprovalCase.flatten(after, '', a);
    const rows: DiffRow[] = [];
    for (const k of new Set([...b.keys(), ...a.keys()])) {
      const bv = b.get(k) ?? '—';
      const av = a.get(k) ?? '—';
      if (bv !== av) rows.push({ path: k, before: bv, after: av });
      if (rows.length >= 60) break;
    }
    return rows.sort((x, y) => (x.path < y.path ? -1 : 1));
  }

  onClose() {
    this.dialogRef.close();
  }

  private done() {
    this.isSaving = false;
    this.dialogRef.close({ event: 'decided' });
  }

  private fail(error: any) {
    this.isSaving = false;
    this.util.handleError(error, 'admin');
  }

  onApprove() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/approval-cases/${this.kase._id}/approve`, {
        note: this.note,
        approvalReference: this.approvalReference,
      })
      .subscribe({ next: () => this.done(), error: (e: any) => this.fail(e) });
  }

  onReject() {
    if (this.isSaving || !this.note.trim()) return;
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/approval-cases/${this.kase._id}/reject`, { note: this.note })
      .subscribe({ next: () => this.done(), error: (e: any) => this.fail(e) });
  }

  onCancel() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.api
      .post_private(`v1/realestate/admin/approval-cases/${this.kase._id}/cancel`, {})
      .subscribe({ next: () => this.done(), error: (e: any) => this.fail(e) });
  }

  onComment() {
    if (!this.commentText.trim()) return;
    this.api
      .post_private(`v1/realestate/admin/approval-cases/${this.kase._id}/comments`, {
        text: this.commentText,
      })
      .subscribe({
        next: (response: any) => {
          const updated = (response && response.data) || null;
          if (updated) this.data.case = updated;
          this.commentText = '';
        },
        error: (e: any) => this.fail(e),
      });
  }
}
