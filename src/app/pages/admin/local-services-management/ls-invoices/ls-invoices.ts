import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-ls-invoices',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-invoices.html',
})
export class LsInvoices {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['invoice', 'booking', 'lines', 'total', 'status', 'actions'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    const param: any = { limit: this.pageSize, page: this.currentPage, status: this.selectedStatus };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) return;
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/local-services/admin/invoices?' + httpParams.toString()).subscribe({
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

  onStatusFilter() {
    this.currentPage = 0;
    this.getList();
  }

  downloadInvoice(invoice: any) {
    const spinnerRef = this.util.start();
    this.api.export_collection('v1/local-services/admin/bookings/' + invoice.booking + '/invoice/pdf').subscribe({
      next: (blob: Blob) => {
        this.util.stop(spinnerRef);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = (invoice.invoiceNo || 'localservice-invoice').replace(/[^a-zA-Z0-9._-]/g, '-') + '.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  voidInvoice(invoice: any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'ts_are_you_sure',
        subTitle: 'ls_void_invoice_instruction',
        okTitle: 'ls_void_invoice',
        closeTitle: 'ts_cancel',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'confirm') {
        const spinnerRef = this.util.start();
        this.api.post_private('v1/local-services/admin/bookings/' + invoice.booking + '/invoice/void', {}).subscribe({
          next: () => {
            this.util.stop(spinnerRef);
            this.util.onSuccess('ls_invoice_voided');
            this.getList();
          },
          error: (error: any) => {
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          },
        });
      }
    });
  }
}
