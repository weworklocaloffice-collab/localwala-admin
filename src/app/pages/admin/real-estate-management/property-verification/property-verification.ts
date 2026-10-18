import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatDialog } from '@angular/material/dialog';

/**
 * Property verification queue (plan §10.2 row 3).
 *
 * Lists every property in `SUBMITTED`, `IN_REVIEW`, or
 * `CHANGES_REQUIRED` and lets the admin transition it via the
 * existing set-status route. No separate "verify" endpoint — the
 * transition itself is the verification action, and the right string
 * (realestate.admin_property_verify) is the audit-grade gate.
 */
@Component({
  selector: 'app-real-estate-property-verification',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './property-verification.html',
})
export class PropertyVerification {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  displayedColumn: string[] = ['code', 'title', 'vendor', 'status', 'action'];

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
    this.api.get_private('v1/realestate/admin/properties/verification-queue?' + httpParams.toString()).subscribe({
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

  onTransition(row: any, target: string) {
    if (this.util.hasRight('realestate.admin_property_verify')) {
      this.api
        .post_private(`v1/realestate/admin/properties/${row._id}/status/${target}`, {})
        .subscribe({
          next: () => {
            this.util.onSuccess('ts_status_updated');
            this.getList();
          },
          error: (error: any) => this.util.handleError(error, 'admin'),
        });
    }
  }
}
