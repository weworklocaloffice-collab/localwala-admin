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
import { DialogCustodyStatement } from '../dialog-custody-statement/dialog-custody-statement';

/**
 * Custody statements (Phase B external leg, ManualCustody).
 *
 * Finance pastes the bank's CSV (documented format shown under the
 * form), then matches it strictly against ledger rows — exact paise
 * within ±7 days, credits against hold debits, debits against refund
 * credits. Near-misses stay visible for humans to clear.
 */
@Component({
  selector: 'app-real-estate-custody-statements',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './custody-statements.html',
})
export class CustodyStatements {
  isLoaded: boolean = false;
  isUploading: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  filename: string = '';
  csvText: string = '';
  displayedColumn: string[] = ['file', 'uploaded', 'rows', 'status', 'matched', 'action'];

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
    this.api.get_private('v1/realestate/admin/custody-statements?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.list = (response && response.results) || [];
        if (this.paginator && response && response.total !== undefined) {
          this.paginator.length = response.total;
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

  onUpload() {
    if (this.isUploading || !this.csvText.trim()) return;
    this.isUploading = true;
    this.api
      .post_private('v1/realestate/admin/custody-statements/upload', {
        filename: this.filename || 'statement.csv',
        csvText: this.csvText,
      })
      .subscribe({
        next: () => {
          this.isUploading = false;
          this.util.onSuccess('ts_created');
          this.filename = '';
          this.csvText = '';
          this.getList();
        },
        error: (error: any) => {
          this.isUploading = false;
          this.util.handleError(error, 'admin');
        },
      });
  }

  onMatch(row: any) {
    this.api.post_private(`v1/realestate/admin/custody-statements/${row._id}/match`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onView(row: any) {
    this.dialog
      .open(DialogCustodyStatement, { disableClose: false, minWidth: '640px', data: { statementId: row._id } })
      .afterClosed()
      .subscribe(() => {
        this.getList();
      });
  }
}
