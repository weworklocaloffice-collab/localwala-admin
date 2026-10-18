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
import { DialogInvoice } from '../dialog-invoice/dialog-invoice';

export const INVOICE_SUPPLIES: string[] = [
  'HOLD_SERVICE_FEE',
  'PROPERTY_SALE_COMMISSION',
  'HOLD_PRINCIPAL',
  'LISTING_PACKAGE_FEE',
];

export const INVOICE_STATUSES: string[] = ['ISSUED', 'CANCELLED'];

/**
 * Invoices (Phase C) — frozen tax rows, never live config.
 *
 * Issued only under approved determinations (the service refuses
 * otherwise), cancelled only via compensating credit note. The
 * GSTR-1 export below renders the same frozen scope finance files.
 */
@Component({
  selector: 'app-real-estate-invoices',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './invoices.html',
})
export class Invoices {
  isLoaded: boolean = false;
  isExporting: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedSupply: string = '';
  selectedStatus: string = '';
  supplies = INVOICE_SUPPLIES;
  statuses = INVOICE_STATUSES;
  gstrFrom: string = '';
  gstrTo: string = '';
  displayedColumn: string[] = ['no', 'supply', 'amounts', 'status', 'issued', 'action'];

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
    if (this.selectedSupply) httpParams = httpParams.set('supply', this.selectedSupply);
    if (this.selectedStatus) httpParams = httpParams.set('status', this.selectedStatus);
    this.api.get_private('v1/realestate/admin/invoices?' + httpParams.toString()).subscribe({
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

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  formatPaise(p: number): string {
    if (p === null || p === undefined) return '—';
    return '₹' + (Number(p) / 100).toLocaleString('en-IN');
  }

  onView(row: any) {
    this.dialog
      .open(DialogInvoice, { disableClose: false, minWidth: '640px', data: { invoiceId: row._id } })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'decided') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }

  onExportGstr1() {
    if (this.isExporting || !this.gstrFrom || !this.gstrTo) return;
    this.isExporting = true;
    const httpParams = new HttpParams().set('from', this.gstrFrom).set('to', this.gstrTo);
    this.api.get_private('v1/realestate/admin/invoices/gstr1?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isExporting = false;
        const csv = (response && response.csv) || '';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `real-estate-gstr1-${this.gstrFrom}_${this.gstrTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        this.isExporting = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
