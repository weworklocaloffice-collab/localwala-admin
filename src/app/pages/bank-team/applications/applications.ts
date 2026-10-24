import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSanction } from '../dialog-sanction/dialog-sanction';
import { DialogReject } from '../dialog-reject/dialog-reject';
import { DialogDisburse } from '../dialog-disburse/dialog-disburse';

/**
 * Bank applications — the bank's loan queue. SANCTIONED / REJECTED /
 * DISBURSED are set HERE and nowhere else (BR-10). Each button POSTs
 * to /applications/:id/status/:status; the backend re-verifies the
 * bank role via bankAuth.
 *
 * ## Why the queue opens the same dialogs as the detail screen
 *
 * The queue used to auto-fill the sanctioned amount from the requested
 * amount and POST a rejection with an empty reason. A sanction is a
 * money decision and a rejection is a statement to the customer; both
 * need a human decision, and both already had a dialog on the detail
 * screen. Two different behaviours for one action is how a bank ends up
 * with a sanctioned amount nobody typed.
 */
@Component({
  selector: 'app-bank-applications',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './applications.html',
})
export class Applications {
  isLoaded: boolean = false;
  list: any[] = [];
  displayedColumn: string[] = ['app', 'amount', 'status', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        this.list = Array.isArray(response) ? response : [];
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /** The row id. The API returns `_id` on the hydrated rows. */
  rowId(row: any): string {
    return row?._id || row?.id || '';
  }

  setStatus(row: any, status: string) {
    const id = this.rowId(row);
    if (!id) {
      this.util.onError('ts_something_went_wrong', '');
      return;
    }
    if (status === 'UNDER_BANK_REVIEW') {
      this.postStatus(id, 'UNDER_BANK_REVIEW', {});
      return;
    }
    if (status === 'SANCTIONED') {
      this.dialog
        .open(DialogSanction, { data: { requestedAmount: row.requestedAmount }, disableClose: true })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus(id, 'SANCTIONED', { sanctionedAmount: result.sanctionedAmount });
          }
        });
      return;
    }
    if (status === 'REJECTED') {
      this.dialog
        .open(DialogReject, { disableClose: true })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus(id, 'REJECTED', { rejectionReason: result.rejectionReason });
          }
        });
      return;
    }
    if (status === 'DISBURSED') {
      this.dialog
        .open(DialogDisburse, {
          data: { sanctionedAmount: row.sanctionedAmount || row.requestedAmount },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((result: any) => {
          if (result && result.event === 'confirmed') {
            this.postStatus(id, 'DISBURSED', { disbursedAmount: result.disbursedAmount });
          }
        });
    }
  }

  postStatus(id: string, status: string, body: any) {
    this.api.post_private(`v1/realestate/bank/applications/${id}/status/${status}`, body).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
