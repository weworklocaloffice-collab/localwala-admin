import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Bank customers — list of customers who have applied for loans
 * through this bank. Shows contact info and application status.
 */
@Component({
  selector: 'app-bank-customers',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './customers.html',
})
export class Customers {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['customerName', 'contact', 'applicationCount', 'latestStatus', 'latestAt'];

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
    this.api.get_private('v1/realestate/bank/customers?' + httpParams.toString()).subscribe({
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

  formatPhone(mobile: string): string {
    if (!mobile) return '—';
    return mobile;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }

  statusBadge(status: string): { class: string, label: string } {
    const statusMap: { [key: string]: { class: string, label: string } } = {
      'SANCTIONED': { class: 'text-success', label: this.util.appTranslate('th_sanctioned') },
      'DISBURSED': { class: 'text-success', label: this.util.appTranslate('th_disbursed') },
      'REJECTED': { class: 'text-danger', label: this.util.appTranslate('th_rejected') },
      'UNDER_BANK_REVIEW': { class: 'text-warn', label: this.util.appTranslate('th_under_review') },
      'APPLICATION_STARTED': { class: 'text-info', label: this.util.appTranslate('th_application_started') },
      'DEFAULT': { class: 'text-muted', label: status }
    };
    return statusMap[status] || statusMap['DEFAULT'];
  }
}