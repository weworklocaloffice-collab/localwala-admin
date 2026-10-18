import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogBankAgreement } from '../dialog-bank-agreement/dialog-bank-agreement';

export const BANK_AGREEMENT_STATUSES: string[] = ['DRAFT', 'ACTIVE', 'EXPIRED'];

/**
 * Bank agreements — versioned commission terms (plan §10.2 row 19, §5.10).
 * The agreement is what turns a disbursement into LocalWala revenue.
 * DRAFT rows are editable here; ACTIVE rows are immutable (new version
 * instead); activating a version retires competing ACTIVE rows.
 */
@Component({
  selector: 'app-real-estate-bank-agreements',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './bank-agreements.html',
})
export class BankAgreements {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  statuses = BANK_AGREEMENT_STATUSES;
  displayedColumn: string[] = ['bank', 'status', 'rate', 'effective', 'action'];

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
    this.api.get_private('v1/realestate/admin/bank-agreements?' + httpParams.toString()).subscribe({
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

  onCreate() {
    this.dialog
      .open(DialogBankAgreement, { disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_created');
          this.getList();
        }
      });
  }

  onEdit(row: any) {
    this.dialog
      .open(DialogBankAgreement, { disableClose: true, data: row })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'created') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onActivate(row: any) {
    this.api.post_private(`v1/realestate/admin/bank-agreements/${row._id}/activate`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onExpire(row: any) {
    this.api.post_private(`v1/realestate/admin/bank-agreements/${row._id}/expire`, {}).subscribe({
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
