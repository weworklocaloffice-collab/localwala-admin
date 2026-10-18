import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

export const VENDOR_VERIFICATION_STATUSES: string[] = [
  'PENDING',
  'UNDER_REVIEW',
  'CHANGES_REQUIRED',
  'APPROVED',
  'REJECTED',
];

/**
 * Vendor verification queue (plan §10.2 row 8).
 *
 * Vendors awaiting a KYC decision, oldest first. Expanding a row shows
 * the vendor's KYC documents with per-category verify, plus the
 * approve / reject vendor actions. Same rights as the property
 * verification queue — no new right, no BR-10 surface.
 */
@Component({
  selector: 'app-real-estate-vendor-verification',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './vendor-verification.html',
})
export class VendorVerification {
  isLoaded: boolean = false;
  list: any[] = [];
  docs: { [vendorId: string]: any[] } = {};
  expanded: string = '';
  selectedStatus: string = '';
  statuses = VENDOR_VERIFICATION_STATUSES;
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['vendor', 'type', 'verification', 'submitted', 'action'];

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
      httpParams = httpParams.set('verificationStatus', this.selectedStatus);
    }
    this.api.get_private('v1/realestate/admin/vendors/verification-queue?' + httpParams.toString()).subscribe({
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

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  toggleDocs(row: any) {
    if (this.expanded === row._id) {
      this.expanded = '';
      return;
    }
    this.expanded = row._id;
    if (!this.docs[row._id]) {
      this.api.get_private(`v1/realestate/admin/vendors/${row._id}/documents`).subscribe({
        next: (response: any) => {
          this.docs[row._id] = (response && response.results) || [];
        },
        error: (error: any) => this.util.handleError(error, 'admin'),
      });
    }
  }

  verifyDoc(row: any, category: string) {
    this.api.patch_private(`v1/realestate/admin/vendors/${row._id}/documents/${category}/verify`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        delete this.docs[row._id];
        this.toggleDocs(row);
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  act(row: any, action: string) {
    this.api.post_private(`v1/realestate/admin/vendors/${row._id}/${action}`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}
