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
import { DialogMarkPackagePaid } from '../dialog-mark-package-paid/dialog-mark-package-paid';

/**
 * Package payments - admin list of listing package orders.
 *
 * Shows all listing package purchases, with status, timestamps, and vendor
 * information (via the joined listing order -> vendor). Payment capture is
 * gateway-driven; the only write here is an explicit, reason-bearing manual
 * mark-paid recovery for orders whose confirmation was lost.
 */
@Component({
  selector: 'app-real-estate-package-payments',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './package-payments.html',
})
export class PackagePayments {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['vendor', 'package', 'amount', 'status', 'createdAt', 'action'];

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
    this.api.get_private('v1/realestate/admin/package-payments?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        const data = (response && response.results) || response;
        this.list = Array.isArray(data) ? data : (data && data.results) || [];
        if (this.paginator && response && response.totalResults !== undefined) {
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

  canMarkPaid(row: any): boolean {
    return (
      !!row &&
      ['PENDING_PAYMENT', 'FAILED', 'CANCELLED'].includes(row.status) &&
      this.util.hasRight('realestate.admin_manage_listings')
    );
  }

  onMarkPaid(row: any) {
    const dialogRef = this.dialog.open(DialogMarkPackagePaid, {
      data: row,
      width: '480px',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event === 'paid') {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      }
    });
  }

  formatPrice(rupees: number): string {
    if (rupees == null) return '-';
    return '\u20B9' + Number(rupees).toLocaleString('en-IN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }
}