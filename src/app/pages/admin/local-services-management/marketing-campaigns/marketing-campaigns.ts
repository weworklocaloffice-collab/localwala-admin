import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogLsCampaignReview } from '../dialog-ls-campaign-review/dialog-ls-campaign-review';

@Component({
  selector: 'app-marketing-campaigns',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './marketing-campaigns.html',
})
export class MarketingCampaigns {
  isLoaded: boolean = false;
  list: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  statusFilter: string = '';
  paymentFilter: string = '';
  displayedColumn: string[] = ['campaign', 'provider', 'package', 'targets', 'window', 'metrics', 'status', 'action'];

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
    if (this.statusFilter) httpParams = httpParams.set('status', this.statusFilter);
    if (this.paymentFilter) httpParams = httpParams.set('paymentStatus', this.paymentFilter);
    this.api.get_private('v1/local-services/admin/marketing/campaigns?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.list = response?.campaigns || [];
        this.paginator.length = response?.totalResults || 0;
        this.paginator.hidePageSize = !response?.totalResults;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onFilter() {
    this.currentPage = 0;
    this.getList();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  targets(row: any) {
    const parts = [];
    if (row.city) parts.push(row.city);
    if (row.targetLocalities?.length) parts.push(row.targetLocalities.join(', '));
    if (row.targetPincodes?.length) parts.push(row.targetPincodes.join(', '));
    return parts.join(' • ') || '—';
  }

  onReview(row: any, decision: string) {
    this.dialog
      .open(DialogLsCampaignReview, { data: { row, decision }, disableClose: true, width: '420px' })
      .afterClosed()
      .subscribe((result: any) => {
        if (result && result.event == 'update') {
          this.util.onSuccess('ts_status_updated');
          this.getList();
        }
      });
  }
}
