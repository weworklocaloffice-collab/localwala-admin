import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * The admin review surface for one store application.
 *
 * ## Why approve and reject live behind a dialog, not a row action
 *
 * `approveAndCommit` is the single most consequential write in the vertical: it creates
 * `Business`, `StoreChain`, `StoreOutlet` and the owner's `StoreRoleAssignment`, and
 * flips the application's status, all in one transaction. A rejection carries a reason
 * the partner reads, so it is free text and cannot be defaulted.
 *
 * Both therefore require a deliberate confirmation that shows what is about to happen.
 * A row-level one-click approve would make an unrecoverable write one misclick away.
 */
@Component({
  selector: 'app-dialog-store-application',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-application.html',
})
export class DialogStoreApplication {
  application: any;
  reason: string = '';
  changesMessage: string = '';
  changesField: string = '';
  changesStep: string = '';
  submitting: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogStoreApplication>,
    private api: ApiService,
    // Public because the template calls `util.appTranslate(...)` for every label. A
    // private member is invisible to the template under AOT, so this would fail the
    // build with TS2341 rather than at runtime.
    public util: UtilService,
  ) {
    this.application = data.application;
  }

  get canReview(): boolean {
    return this.application?.status === 'submitted';
  }

  get canDecide(): boolean {
    return this.application?.status === 'under_review';
  }

  get requiresReason(): boolean {
    return this.application?.status === 'under_review';
  }

  close(event?: string) {
    this.dialogRef.close({ event });
  }

  startReview() {
    this.submitting = true;
    this.api
      .patch_private('v1/admin/stores/applications/' + this.application._id, {})
      .subscribe({
        next: () => {
          this.submitting = false;
          this.util.onSuccess('ts_stores_application_in_review');
          this.close('review');
        },
        error: (error: any) => {
          this.submitting = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  approve() {
    if (this.requiresReason && !this.reason.trim()) {
      this.util.onError('ts_stores_reason_required', '');
      return;
    }

    this.submitting = true;
    this.api
      .post_private('v1/admin/stores/applications/' + this.application._id, {})
      .subscribe({
        next: () => {
          this.submitting = false;
          this.util.onSuccess('ts_stores_application_approved');
          this.close('approve');
        },
        error: (error: any) => {
          this.submitting = false;
          // The approve path runs a guarded transaction. Its failures are specific and
          // actionable — missing approved documents, no category, absent location — and
          // the API message says which. Showing that message beats a generic failure.
          const apiMessage =
            error && error.error && error.error.message ? error.error.message : '';
          if (apiMessage) {
            this.util.onError(apiMessage, '');
          } else {
            this.util.handleError(error, 'admin');
          }
        },
      });
  }

  reject() {
    // A rejection is refused without a reason: the partner is told why, and an empty
    // reason is an unreadable notification rather than a decision. Min 3 mirrors
    // the backend, so the refusal lands before the round trip, not after.
    if (this.reason.trim().length < 3) {
      this.util.onError('ts_stores_reason_required', '');
      return;
    }

    this.submitting = true;
    this.api
      .post_private('v1/admin/stores/applications/' + this.application._id + '/reject', {
        reason: this.reason,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.util.onSuccess('ts_stores_application_rejected');
          this.close('reject');
        },
        error: (error: any) => {
          this.submitting = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  requestChanges() {
    // Backend takes step as an integer 0-8 and message min 3. Joi coerces a
    // numeric string, but "step three" would 400 after the round trip — refuse
    // it here with the same message the operator already reads.
    const stepNum = Number(String(this.changesStep).trim());
    if (!Number.isInteger(stepNum) || stepNum < 0 || stepNum > 8 || this.changesMessage.trim().length < 3) {
      this.util.onError('ts_stores_changes_required', '');
      return;
    }

    this.submitting = true;
    this.api
      .post_private('v1/admin/stores/applications/' + this.application._id + '/request-changes', {
        step: stepNum,
        field: this.changesField || String(stepNum),
        message: this.changesMessage,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.util.onSuccess('ts_stores_changes_requested');
          this.close('changes');
        },
        error: (error: any) => {
          this.submitting = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}