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

@Component({
  selector: 'app-ls-settlements',
  imports: [CommonModule, MaterialModule],
  templateUrl: './settlements.html',
})
export class Settlements implements OnInit {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['settlement', 'counterparty', 'period', 'orders', 'gross', 'refunds', 'fees', 'net', 'status', 'action'];

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
    const httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
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
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
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
      .open(DialogLsSettlementPayout, { data: { id: row._id, row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
