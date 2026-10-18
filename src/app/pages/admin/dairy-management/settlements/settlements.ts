import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogSettlementStatus } from '../dialog-settlement-status/dialog-settlement-status';
import { DialogSettlementPay } from '../dialog-settlement-pay/dialog-settlement-pay';
import { DialogSettlementGenerate } from '../dialog-settlement-generate/dialog-settlement-generate';

/**
 * The moves the API will accept from each status.
 *
 * Mirrors `assertTransition` in `dairy.settlement.service`. Offering an action the
 * API will refuse wastes an operator's click and then shows them a raw transition
 * error, so the screen offers only what is actually legal from where the document
 * currently sits.
 *
 * `paid` is deliberately absent: payout is `POST /settlements/:settlement/pay`, not
 * a status patch, because it moves money as well as state.
 *
 * Exported so `settlements.spec.ts` can compare it against the service's own table —
 * a copy of this table drifting from the API is exactly the bug that would go
 * unnoticed until an operator hit a 400.
 */
export const SETTLEMENT_TRANSITIONS: { [status: string]: string[] } = {
  draft: ['submitted', 'void'],
  submitted: ['approved', 'draft', 'disputed', 'void'],
  approved: ['disputed', 'void'],
  disputed: ['approved', 'draft', 'void'],
  paid: [],
  void: [],
};

@Component({
  selector: 'app-dairy-settlements',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './settlements.html',
})
export class Settlements {
  isLoaded: boolean = false;
  isSummaryLoaded: boolean = false;
  list: any[] = [];
  summary: any = {};
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  selectedType: string = '';
  displayedColumn: string[] = ['settlementNo', 'party', 'period', 'net', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
    this.getSummary();
  }

  getList() {
    this.isLoaded = false;
    const param: any = {
      limit: this.pageSize,
      page: this.currentPage,
      status: this.selectedStatus,
      settlementType: this.selectedType,
    };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) {
        return;
      }
      httpParams = httpParams.set(key, param[key]);
    });

    this.api.get_private('v1/dairy/settlements?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.settlements) {
          this.list = response.settlements;
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

  getSummary() {
    this.api.get_private('v1/dairy/settlements/summary/all').subscribe({
      next: (response: any) => {
        this.summary = response && response.summary ? response.summary.byType || {} : {};
        this.isSummaryLoaded = true;
      },
      error: (error: any) => {
        this.isSummaryLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /** Total owed or owing across one settlement type, by status. */
  netFor(type: string, status: string): number {
    const row = this.summary[type] && this.summary[type][status];
    return row ? row.net : 0;
  }

  countFor(type: string, status: string): number {
    const row = this.summary[type] && this.summary[type][status];
    return row ? row.count : 0;
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

  actionsFor(row: any): string[] {
    return SETTLEMENT_TRANSITIONS[row.status] || [];
  }

  /**
   * Applies a status change.
   *
   * Void is the one transition that needs a reason, because it writes off a
   * financial statement — the API accepts an empty one, so requiring it is this
   * screen's decision, not a technical constraint.
   */
  onChangeStatus(row: any, status: string) {
    this.dialog
      .open(DialogSettlementStatus, { data: { row: row, status: status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_settlement_updated');
          this.getList();
          this.getSummary();
        }
      });
  }

  onPay(row: any) {
    this.dialog
      .open(DialogSettlementPay, { data: { row: row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_settlement_paid');
          this.getList();
          this.getSummary();
        }
      });
  }

  onGenerate() {
    this.dialog
      .open(DialogSettlementGenerate, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'generated') {
          this.util.onSuccess('ts_settlement_generated');
          this.getList();
          this.getSummary();
        }
      });
  }
}
