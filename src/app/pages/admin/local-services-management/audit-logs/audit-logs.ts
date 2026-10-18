import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-local-services-audit-logs',
  imports: [CommonModule, MaterialModule],
  templateUrl: './audit-logs.html',
})
export class LocalServicesAuditLogs {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['event', 'target', 'actor', 'created'];

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
    const httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    this.api.get_private('v1/local-services/admin/audit-logs?' + httpParams.toString()).subscribe({
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

  exportCsv() {
    if (!this.list || this.list.length === 0) {
      this.util.onSuccess('ts_no_records_found');
      return;
    }
    // Build CSV data
    const headers = ['Event', 'Target Type', 'Target ID', 'Actor', 'Actor Role', 'Created'];
    const rows = this.list.map((element: any) => [
      element.event || '',
      element.target_type || '',
      element.target_id || '',
      element.actor || '',
      element.actor_role || '',
      element.created_at || '',
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => {
        const c = cell instanceof Date ? cell.toISOString() : cell;
        return typeof c === 'number' ? c.toString() : `"${c}"`;
      }).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    link.setAttribute('download', 'local-services-audit-logs.csv');
    link.click();
  }
}