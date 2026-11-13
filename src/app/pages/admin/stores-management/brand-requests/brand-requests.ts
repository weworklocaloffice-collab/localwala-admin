/**
 * LocalWala - Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright (c) 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential. Unauthorized copying, redistribution, resale,
 * publication, modification, or use of this source code is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|ANGULAR
 */

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-stores-brand-requests',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './brand-requests.html',
})
export class BrandRequests {
  requests: any[] = [];
  total = 0;
  page = 1;
  limit = 20;
  pageSize = 20;
  totalPages = 1;
  statusFilter = 'pending';
  searchQuery = '';
  isLoaded = false;
  reviewing = '';

  displayedColumn = ['name', 'chain', 'taxonomy', 'requested', 'status', 'action'];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    private api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialog,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;

    let params = new HttpParams()
      .set('status', this.statusFilter || 'all')
      .set('page', this.page)
      .set('limit', this.pageSize);
    if (this.searchQuery) params = params.set('search', this.searchQuery);

    this.api
      .get_private('v1/admin/stores/catalog/brand-requests?' + params.toString())
      .subscribe({
        next: (response: any) => {
          this.requests = response && response.requests ? response.requests : [];
          this.total = response && response.total ? response.total : 0;
          this.totalPages = response && response.totalPages ? response.totalPages : 1;
          if (this.paginator) {
            this.paginator.length = this.total;
            this.paginator.pageSize = this.limit;
          }
          this.isLoaded = true;
        },
        error: (error: any) => {
          this.requests = [];
          this.isLoaded = true;
          this.util.handleError(error, 'admin');
        },
      });
  }

  onSearch() {
    this.page = 1;
    this.getList();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter() {
    this.page = 1;
    this.getList();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.getList();
  }

  confirmReview(request: any, status: 'approved' | 'rejected') {
    const ref = this.dialogRef.open(ConfirmDialog, {
      data: {
        title: status === 'approved' ? 'stores_brand_request_approve_title' : 'stores_brand_request_reject_title',
        subTitle: status === 'approved' ? 'stores_brand_request_approve_body' : 'stores_brand_request_reject_body',
        okTitle: status === 'approved' ? 'approve' : 'reject',
        closeTitle: 'ts_cancel',
      },
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result && result.action === 'confirm') this.review(request, status);
    });
  }

  private review(request: any, status: 'approved' | 'rejected') {
    this.reviewing = request._id;

    this.api
      .patch_private('v1/admin/stores/catalog/brand-requests/' + request._id, { status })
      .subscribe({
        next: () => {
          this.reviewing = '';
          this.util.onSuccess(status === 'approved' ? 'stores_brand_request_approved' : 'stores_brand_request_rejected');
          this.getList();
        },
        error: (error: any) => {
          this.reviewing = '';
          this.util.handleError(error, 'admin');
        },
      });
  }
}
