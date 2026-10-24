import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-policies',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './ls-policies.html',
})
export class LsPolicies {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  displayedColumn: string[] = ['code', 'scope', 'policy', 'status', 'action'];

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
    const param: any = { limit: this.pageSize, page: this.currentPage, status: this.selectedStatus };
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      if (param[key] === '' || param[key] === null || param[key] === undefined) return;
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/local-services/admin/policies?' + httpParams.toString()).subscribe({
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

  scopeOf(row: any): string {
    if (row.provider) return 'Provider';
    if (row.serviceKey) return `Service: ${row.serviceKey}`;
    if (row.subcategoryKey) return `Subcategory: ${row.subcategoryKey}`;
    if (row.categoryKey) return `Category: ${row.categoryKey}`;
    return 'Platform';
  }

  activate(row: any) {
    this.api.post_private('v1/local-services/admin/policies/' + row._id + '/activate', {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  deactivate(row: any) {
    this.api.post_private('v1/local-services/admin/policies/' + row._id + '/inactive', { note: 'deactivated' }).subscribe({
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
