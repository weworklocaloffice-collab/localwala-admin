import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsSettlement } from '../dialog-ls-settlement/dialog-ls-settlement';
import { DialogLsSettlementPayout } from '../dialog-ls-settlement-payout/dialog-ls-settlement-payout';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-settlements',
  imports: [CommonModule, MaterialModule, LsStatusBadge],
  templateUrl: './settlements.html',
})
export class Settlements implements OnInit {
  isLoaded: boolean = false;
  hasError: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = '';
  displayedColumn: string[] = ['settlement', 'counterparty', 'period', 'age', 'orders', 'gross', 'refunds', 'fees', 'net', 'status', 'action'];

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
    this.hasError = false;
    let httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    if (this.sortBy) httpParams = httpParams.set('sortBy', this.sortBy);
    this.api.get_private('v1/local-services/admin/revenue/settlements?' + httpParams.toString()).subscribe({
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
        this.hasError = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  ageDays(row: any): number {
    const created = row.createdAt ? new Date(row.createdAt).getTime() : (row.from ? new Date(row.from).getTime() : Date.now());
    return Math.floor((Date.now() - created) / 86400000);
  }

  isOverdue(row: any): boolean {
    return row.status !== 'settled' && row.status !== 'reversed' && this.ageDays(row) > 7;
  }

  retryAllFailed() {
    const failed = this.list.filter((r) => r.status === 'failed');
    if (!failed.length) return;
    failed.forEach((r) => this.onStatus(r, 'processing'));
  }

  onSortChange(event: any) {
    const fields: any = { settlement: 'settlementNo', period: 'from', status: 'status' };
    this.sortBy = fields[event.active] && event.direction ? fields[event.active] + ':' + event.direction : '';
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.getList();
  }

  onGenerate() {
    this.dialog
      .open(DialogLsSettlement, { disableClose: true, width: '520px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess(result.data?.note || 'ts_record_created');
          this.getList();
        }
      });
  }

  onStatus(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, { data: { apiPath: 'v1/local-services/admin/revenue/settlements/', row, status }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  /** Paying moves money: a wallet credit, or a bank reference to execute. */
  onPay(row: any) {
    this.dialog
      .open(DialogLsSettlementPayout, { data: { id: row.id || row._id, row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
