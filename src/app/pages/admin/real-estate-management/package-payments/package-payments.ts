import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Package payments — admin read-only list of paid listing package orders.
 *
 * Shows all completed listing package purchases, with status, timestamps,
 * and vendor information (via the joined listing order → vendor).
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
  displayedColumn: string[] = ['vendor', 'package', 'amount', 'status', 'createdAt'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
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

  formatPrice(paise: number): string {
    if (!paise) return '—';
    return '₹' + (paise / 100).toLocaleString('en-IN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }
}