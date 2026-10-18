import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogSettlementGenerate } from '../dialog-settlement-generate/dialog-settlement-generate';

export const SETTLEMENT_STATUSES: string[] = [
  'PENDING',
  'VERIFIED',
  'EARNED',
  'SETTLEMENT_CREATED',
  'PAID',
];

@Component({
  selector: 'app-real-estate-settlements',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './settlements.html',
})
export class Settlements {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  statuses = SETTLEMENT_STATUSES;
  displayedColumn: string[] = ['no', 'party', 'period', 'net', 'status', 'action'];

  /** Next workflow step per status — the chain is linear, no skips. */
  nextStep: Record<string, { to: string; label: string }> = {
    PENDING: { to: 'VERIFIED', label: 'Verify' },
    VERIFIED: { to: 'EARNED', label: 'Mark earned' },
    EARNED: { to: 'SETTLEMENT_CREATED', label: 'Create statement' },
    SETTLEMENT_CREATED: { to: 'PAID', label: 'Mark paid' },
  };

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

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
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    this.api.get_private('v1/realestate/admin/settlements?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.list = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  /**
   * Settlements generate FROM frozen ledger entry ids — a later
   * correction lands in the next period, never in this statement.
   */
  onGenerate() {
    this.dialog
      .open(DialogSettlementGenerate, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'generated') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onAdvance(row: any) {
    const step = this.nextStep[row.status];
    if (!step) return;
    let payoutReference = '';
    if (step.to === 'PAID') {
      const ref = prompt('Payout reference for ' + (row.settlementNo || row._id) + '?');
      if (ref === null) return;
      payoutReference = (ref || '').trim();
    }
    this.api
      .post_private(`v1/realestate/admin/settlements/${row._id}/status/${step.to}`, { payoutReference })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
  }
}
