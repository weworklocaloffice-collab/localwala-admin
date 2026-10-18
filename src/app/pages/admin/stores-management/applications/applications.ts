import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresListBase } from '../stores-list-base';
import { DialogStoreApplication } from '../dialog-application/dialog-application';

/**
 * The Local Stores application queue.
 *
 * ## Why this screen exists before anything else
 *
 * The implementation plan records a trap it calls T1: the Dairy vertical shipped 141
 * admin routes and zero Angular pages, so every admin-only capability was unreachable
 * and nobody noticed until a partner asked why their subscription could not be
 * approved. Applications are the single most admin-only surface in this vertical — an
 * application cannot move itself — so if this screen were deferred, the entire vertical
 * would be stuck at `submitted` with no way out.
 *
 * ## Why the status column is a plain label, not a dropdown
 *
 * The lifecycle is a server-side transition table with guards (documents approved,
 * subscription paid, location present). A dropdown would offer the operator moves the
 * server will refuse, and the refusal message would arrive after they committed to it.
 * So each row exposes exactly the actions that are legal from its current state.
 */
@Component({
  selector: 'app-stores-applications',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './applications.html',
})
export class Applications extends StoresListBase {
  selectedStatus: string = '';

  constructor(
    api: ApiService,
    util: UtilService,
    public override dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'applications';
    this.listTitleKey = 'stores_applications_list';
    this.displayedColumn = ['business', 'store', 'status', 'step', 'submittedAt', 'action'];
  }

  /** `status` is accepted as an array by the API, so a single value is sent as one. */
  override get extraQuery(): any {
    return this.selectedStatus ? { status: this.selectedStatus } : {};
  }

  override onStatusFilter(status: string) {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.getList();
  }

  openApplication(element: any) {
    const ref = this.dialogRef.open(DialogStoreApplication, {
      data: { application: element },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.event) {
        this.util.onSuccess('ts_stores_application_updated');
        this.getList();
      }
    });
  }

  /**
   * Moves an application into review. Separate from `approve` because `startReview` is
   * a distinct server transition with its own audit row, not a shortcut to approval.
   */
  startReview(element: any) {
    this.patch('applications/' + element._id, {}, 'ts_stores_application_in_review');
  }

  hasAction(element: any, action: string): boolean {
    // Review is the only row-level move. Approve/reject/request-changes live
    // inside the review dialog on purpose: approve commits Business + chain +
    // outlet + assignment in one transaction, and rejection carries a reason
    // the partner reads. A row-level approve once called PATCH .../approve, a
    // route that does not exist (approve is POST without suffix) — and even
    // fixed, one-click commit would put an unrecoverable write one misclick
    // away. Deciding happens behind the confirmation dialog, not here.
    if (action === 'review') {
      return element.status === 'submitted';
    }
    return false;
  }
}