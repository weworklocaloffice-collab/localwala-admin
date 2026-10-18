import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogApprovalCase } from '../dialog-approval-case/dialog-approval-case';

export const APPROVAL_STATUSES: string[] = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'ACTIVATED',
];

/**
 * Approval queue (Phase A governance, OD-01/OD-04).
 *
 * Finance/legal works REQUESTED cases from here: each row opens the
 * frozen diff, evidence and comment trail. Decisions carry the
 * approve right; the service enforces requester ≠ approver, so a
 * small team cannot self-approve even with overlapping roles.
 */
@Component({
  selector: 'app-real-estate-approvals',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './approvals.html',
})
export class Approvals {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = 'REQUESTED';
  statuses = APPROVAL_STATUSES;
  selectedCategory: string = '';
  categories: string[] = ['HOLD_POLICY', 'BANK_AGREEMENT', 'COMMISSION_RULE', 'TAX_CONFIG', 'CUSTODY_CONFIG'];
  displayedColumn: string[] = ['case', 'target', 'requester', 'sla', 'status', 'action'];

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
    if (this.selectedStatus) {
      httpParams = httpParams.set('status', this.selectedStatus);
    }
    if (this.selectedCategory) {
      httpParams = httpParams.set('category', this.selectedCategory);
    }
    this.api.get_private('v1/realestate/admin/approval-cases?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.list = (response && response.results) || [];
        if (this.paginator && response && response.total !== undefined) {
          this.paginator.length = response.total;
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

  isOverdue(row: any): boolean {
    return row.status === 'REQUESTED' && !!row.slaDue && new Date(row.slaDue).getTime() < Date.now();
  }

  requesterName(row: any): string {
    const u = row.requester || {};
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '';
  }

  onView(row: any) {
    this.dialog
      .open(DialogApprovalCase, { disableClose: false, minWidth: '640px', data: { caseId: row._id } })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'decided') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
