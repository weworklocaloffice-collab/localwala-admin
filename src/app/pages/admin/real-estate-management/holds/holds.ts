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
import { DialogHoldForfeit } from '../dialog-hold-forfeit/dialog-hold-forfeit';

export const HOLD_STATUSES: string[] = [
  'PENDING_PAYMENT',
  'ACTIVE',
  'EXPIRED',
  'CANCELLED',
  'CONVERTED_TO_SALE',
  'REFUND_PENDING',
  'REFUNDED',
  'ADJUSTED',
];

@Component({
  selector: 'app-real-estate-holds',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './holds.html',
})
export class Holds {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = 'ACTIVE';
  statuses = HOLD_STATUSES;
  displayedColumn: string[] = ['code', 'principal', 'fee', 'status', 'expires', 'action'];

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
    this.api.get_private('v1/realestate/admin/holds?' + httpParams.toString()).subscribe({
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
   * Forfeiture — dual control. The dialog collects requester +
   * reason; the approver is the signed-in admin. The API rejects
   * requester === approver.
   */
  onForfeit(row: any) {
    this.dialog
      .open(DialogHoldForfeit, { data: { row: row }, disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
