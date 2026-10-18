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
 * Admin — executive assignment queue (plan §10.2 row 15, §10.3).
 *
 * PENDING_ASSIGNMENT visit requests + auto-assignment preview so admin
 * sees what the engine *would* do, with manual override. An assignment
 * engine with no override is an outage waiting to happen.
 */
@Component({
  selector: 'app-real-estate-executive-assignment',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './executive-assignment.html',
})
export class ExecutiveAssignment {
  isLoaded: boolean = false;
  list: any[] = [];
  executives: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  preview: any = null;
  previewFor: string = '';
  selectedExec: { [requestId: string]: string } = {};
  displayedColumn: string[] = ['request', 'customer', 'preferred', 'suggested', 'assign'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
    this.getExecutives();
  }

  getList() {
    this.isLoaded = false;
    const httpParams = new HttpParams()
      .set('status', 'PENDING_ASSIGNMENT')
      .set('limit', this.pageSize)
      .set('page', this.currentPage + 1);
    this.api.get_private('v1/realestate/admin/visit-requests?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.list = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        } else {
          this.list = Array.isArray(response) ? response : [];
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  getExecutives() {
    this.api.get_private('v1/realestate/admin/executives?limit=200&available=true').subscribe({
      next: (response: any) => {
        const data = (response && response.results) || response || [];
        this.executives = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.executives = [];
      },
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onPreview(row: any) {
    this.preview = null;
    this.previewFor = row._id;
    this.api.get_private(`v1/realestate/admin/visit-requests/${row._id}/preview`).subscribe({
      next: (response: any) => {
        this.preview = response;
        if (response && response.suggested) {
          this.selectedExec[row._id] = response.suggested._id;
        }
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  onAssign(row: any) {
    if (!this.util.hasRight('realestate.admin_executive_manage')) return;
    const executiveId = this.selectedExec[row._id];
    if (!executiveId) return;
    this.api
      .post_private(`v1/realestate/admin/visit-requests/${row._id}/assign`, { executiveId })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_status_updated');
          this.preview = null;
          this.previewFor = '';
          this.getList();
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
  }
}
