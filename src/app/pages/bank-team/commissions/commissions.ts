import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Bank commissions — the bank's commission earnings.
 *
 * BR-16: bank commission is computed on the sanctioned/disbursed amount,
 * never on the property sale value. The `ruleSnapshot` on each row
 * shows exactly what was in force at resolution time.
 */
@Component({
  selector: 'app-bank-commissions',
  imports: [CommonModule, MaterialModule],
  templateUrl: './commissions.html',
})
export class Commissions {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['commissionNo', 'baseAmount', 'rate', 'amount', 'status', 'resolvedAt'];

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
    this.api.get_private('v1/realestate/bank/commissions?' + httpParams.toString()).subscribe({
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

  formatPrice(paise: number): string {
    if (!paise) return '—';
    return '₹' + (paise / 100).toLocaleString('en-IN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }

  statusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': this.util.appTranslate('th_pending'),
      'VERIFIED': this.util.appTranslate('th_verified'),
      'EARNED': this.util.appTranslate('th_earned'),
      'PAID': this.util.appTranslate('th_paid'),
      'REVERSED': this.util.appTranslate('th_reversed'),
    };
    return statusMap[status] || status;
  }
}