import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Settlement register.
 *
 * ## The sign convention is not optional to get right
 *
 * `netAmount` POSITIVE means the platform owes the store; NEGATIVE means the store owes
 * the platform (a refund recovered against the next settlement). That convention is
 * inherited from the dairy settlement engine and is recorded as a 100x-class bug in the
 * dairy plan — a totals-recompute path that inverted it. This screen therefore shows the
 * signed value verbatim and never reformats it as an absolute, because a column that hid
 * the sign would let a negative settlement look like a payout.
 */
@Component({
  selector: 'app-stores-settlements',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './settlements.html',
})
export class Settlements implements OnInit {
  isLoaded = false;
  list: any[] = [];
  currentPage = 0;
  pageSize = 10;
  statusFilter = '';

  /** Column order for `mat-table`. Declared here because the template binds it. */
  displayedColumn = [
    'settlementNo',
    'counterparty',
    'period',
    'orders',
    'netAmount',
    'status',
    'action',
  ];

  readonly STATUSES = ['pending', 'processing', 'settled', 'failed', 'reversed', 'disputed'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    private api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;

    let params = new HttpParams()
      .set('page', String(this.currentPage + 1))
      .set('limit', String(this.pageSize))
      .set('vertical', 'stores');
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.api.get_private('v1/admin/stores/settlements?' + params.toString()).subscribe({
      next: (response: any) => {
        this.list = response && response.results ? response.results : [];
        if (this.paginator) {
          this.paginator.length = response && response.totalResults ? response.totalResults : 0;
          this.paginator.hidePageSize = !response || !response.totalResults;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.list = [];
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter(status: string) {
    this.statusFilter = status;
    this.currentPage = 0;
    this.getList();
  }

  netAmount(row: any): number {
    return row.totals && row.totals.netAmount !== undefined ? row.totals.netAmount : 0;
  }

  /**
   * Negative means the STORE owes the platform, so the label has to say which direction
   * the money moves. A bare "-450" is ambiguous to whoever is reconciling it.
   */
  isOwedToPlatform(row: any): boolean {
    return this.netAmount(row) < 0;
  }

  orderCount(row: any): number {
    return row.totals && row.totals.orderCount !== undefined ? row.totals.orderCount : 0;
  }

  periodLabel(row: any): string {
    return row.from && row.to ? row.from + ' → ' + row.to : row.period || '—';
  }

  // -- actions ----------------------------------------------------------------
  // Each is gated on the settlement's CURRENT state, mirroring the service's guards.
  // `settled` and `reversed` are terminal: a reversal is a new entry (BR-25), never an
  // edit of the original, so there is nothing left to do to a reversed settlement.

  canSettle(row: any): boolean {
    return row.status === 'pending' || row.status === 'processing';
  }

  canFail(row: any): boolean {
    return row.status === 'pending' || row.status === 'processing';
  }

  canReverse(row: any): boolean {
    return row.status === 'settled';
  }

  settle(row: any) {
    this.api
      .post_private('v1/admin/stores/settlements/' + row._id + '/settle', {
        payoutMethod: 'bank',
      })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_settlement_settled');
          this.getList();
        },
        error: (error: any) => {
          const msg = error && error.error && error.error.message ? error.error.message : '';
          if (msg) {
            this.util.onError(msg, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }

  markFailed(row: any) {
    this.api
      .post_private('v1/admin/stores/settlements/' + row._id + '/fail', {
        failureReason: 'Marked failed by admin',
      })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_settlement_failed');
          this.getList();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
          this.getList();
        },
      });
  }

  reverse(row: any) {
    this.api
      .post_private('v1/admin/stores/settlements/' + row._id + '/reverse', {
        reason: 'Reversed by admin',
      })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_settlement_reversed');
          this.getList();
        },
        error: (error: any) => {
          const msg = error && error.error && error.error.message ? error.error.message : '';
          if (msg) {
            this.util.onError(msg, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }
}