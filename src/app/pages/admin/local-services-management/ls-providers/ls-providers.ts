import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsStatus } from '../dialog-ls-status/dialog-ls-status';
import { LsStatusBadge } from '../ls-status-badge/ls-status-badge';

@Component({
  selector: 'app-ls-providers',
  imports: [CommonModule, FormsModule, MaterialModule, LsStatusBadge],
  templateUrl: './ls-providers.html',
})
export class LsProviders {
  isLoaded: boolean = false;
  hasError: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  selectedStatus: string = '';
  search: string = '';
  sortBy: string = '';
  displayedColumn: string[] = ['select', 'business', 'contact', 'location', 'services', 'verification', 'status', 'action'];
  selection: Set<string> = new Set();
  bulkStatus: string = '';
  bulkStatuses: string[] = ['UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'REJECTED'];

  providerTransitions: any = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'DRAFT'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'SUBMITTED'],
    APPROVED: ['ACTIVE', 'SUSPENDED'],
    ACTIVE: ['SUSPENDED', 'INACTIVE'],
    SUSPENDED: ['ACTIVE', 'INACTIVE'],
    INACTIVE: ['ACTIVE'],
    REJECTED: ['DRAFT'],
    CLOSED: [],
  };

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.hasError = false;
    let httpParams = new HttpParams().set('limit', this.pageSize).set('page', this.currentPage + 1);
    if (this.selectedStatus) httpParams = httpParams.set('status', this.selectedStatus);
    if (this.search) httpParams = httpParams.set('search', String(this.search).trim());
    if (this.sortBy) httpParams = httpParams.set('sortBy', this.sortBy);
    this.api.get_private('v1/local-services/admin/providers?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.list = response.results;
          this.paginator.length = response.totalResults;
          this.paginator.hidePageSize = response.totalResults <= 0 ? true : false;
        }
        this.selection.clear();
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.hasError = true;
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

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  rowId(row: any): string { return row.id || row._id; }

  isSelected(row: any): boolean { return this.selection.has(this.rowId(row)); }

  toggleRow(row: any) {
    const id = this.rowId(row);
    if (this.selection.has(id)) this.selection.delete(id); else this.selection.add(id);
  }

  toggleAll() {
    if (this.selection.size === this.list.length) this.selection.clear();
    else this.list.forEach((r) => this.selection.add(this.rowId(r)));
  }

  allSelected(): boolean { return this.list.length > 0 && this.selection.size === this.list.length; }

  someSelected(): boolean { return this.selection.size > 0 && this.selection.size < this.list.length; }

  onBulkTransition() {
    if (!this.bulkStatus || !this.selection.size) return;
    this.api.post_private('v1/local-services/admin/providers/bulk-transition', { ids: [...this.selection], status: this.bulkStatus }).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.selection.clear();
        this.bulkStatus = '';
        this.getList();
      },
      error: (err: any) => this.util.handleError(err, 'admin'),
    });
  }

  onSortChange(event: any) {
    const fields: any = { business: 'businessName', contact: 'contactName', status: 'status' };
    this.sortBy = fields[event.active] && event.direction ? fields[event.active] + ':' + event.direction : '';
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.getList();
  }

  openDetail(row: any) {
    this.router.navigate(['/admin/local-services-management/providers', row.id || row._id]);
  }

  openProviderTypes() {
    this.router.navigate(['/admin/local-services-management/provider-types']);
  }

  nextStatuses(status: string): string[] {
    return this.providerTransitions[status] || [];
  }

  statusIcon(status: string): string {
    const icons: any = {
      SUBMITTED: 'send',
      UNDER_REVIEW: 'visibility',
      DRAFT: 'undo',
      APPROVED: 'check_circle',
      REJECTED: 'cancel',
      ACTIVE: 'play_circle',
      SUSPENDED: 'pause_circle',
      INACTIVE: 'block',
      CLOSED: 'lock',
    };
    return icons[status] || 'arrow_forward';
  }

  statusColor(status: string): string {
    if (status === 'ACTIVE' || status === 'APPROVED') return 'text-success';
    if (status === 'REJECTED' || status === 'SUSPENDED' || status === 'INACTIVE' || status === 'CLOSED') return 'text-error';
    if (status === 'UNDER_REVIEW') return 'text-primary';
    return 'text-warning';
  }

  ownerName(owner: any): string {
    if (!owner || typeof owner !== 'object') return '';
    return [owner.firstName, owner.lastName].filter(Boolean).join(' ');
  }

  onTransition(row: any, status: string) {
    this.dialog
      .open(DialogLsStatus, {
        data: { apiPath: 'v1/local-services/admin/providers/', row, status },
        disableClose: true,
        width: '560px',
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
