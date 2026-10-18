import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { AdminReelListItem, ReelStatus } from 'src/app/interfaces/admin.reels.interface';
import { REEL_STATUSES } from '../reels.constants';
import { DialogReelPreview } from '../dialog-reel-preview/dialog-reel-preview';
import { DialogReelAnalytics } from '../dialog-reel-analytics/dialog-reel-analytics';

@Component({
  selector: 'app-reels-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './reels-list.html',
})
export class ReelsList {

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  reels = new MatTableDataSource<AdminReelListItem>([]);
  displayedColumn = ['video', 'vertical', 'target', 'status', 'likes', 'action'];
  // NOTE: the list API returns counters, not view totals (those need an
  // aggregation per row) — per-reel views live in the Analytics dialog.
  pageSize: number = 10;
  currentPage: number = 1;
  isLoaded: boolean = false;
  activeStatus: string = '';

  readonly statuses: ReelStatus[] = REEL_STATUSES;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.getList();
  }

  statusLabel(item: AdminReelListItem): string {
    return item.status || 'DRAFT';
  }

  targetLabel(item: AdminReelListItem): string {
    if (!item.target || !item.target.type) return '-';
    const ref = item.target.refId ? ` · ${String(item.target.refId).slice(-6)}` : '';
    return `${item.target.type}${ref}`;
  }

  getList() {
    this.isLoaded = false;
    const param: any = { limit: this.pageSize, page: this.currentPage };
    if (this.activeStatus) param['status'] = this.activeStatus;
    let httpParams = new HttpParams();
    Object.keys(param).forEach((key: any) => {
      httpParams = httpParams.set(key, param[key]);
    });
    this.api.get_private('v1/admin/reels?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.results) {
          this.reels = new MatTableDataSource<AdminReelListItem>(response.results);
          this.paginator.length = response.totalResults || 0;
        }
      }, error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onTabChange(index: number) {
    this.activeStatus = index === 0 ? '' : this.statuses[index - 1];
    this.currentPage = 1;
    this.paginator.firstPage();
    this.getList();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onAdd() {
    this.router.navigate(['admin/reels/reel-form']);
  }

  onEdit(item: AdminReelListItem) {
    this.router.navigate(['admin/reels/reel-form', item.id]);
  }

  onPreview(item: AdminReelListItem) {
    this.dialog.open(DialogReelPreview, { data: { id: item.id }, disableClose: false, width: '420px' });
  }

  onAnalytics(item: AdminReelListItem) {
    this.dialog.open(DialogReelAnalytics, { data: { id: item.id }, disableClose: false, width: '520px' });
  }

  onReports(item: AdminReelListItem) {
    this.router.navigate(['admin/reels/reel-reports'], { queryParams: { reel: item.id } });
  }

  onPublish(item: AdminReelListItem) {
    const spinnerRef = this.util.start();
    this.api.post_private('v1/admin/reels/' + item.id + '/publish', {}).subscribe({
      next: () => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_status_updated');
        this.getList();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onPause(item: AdminReelListItem) {
    const spinnerRef = this.util.start();
    this.api.post_private('v1/admin/reels/' + item.id + '/pause', {}).subscribe({
      next: () => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_status_updated');
        this.getList();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onDuplicate(item: AdminReelListItem) {
    const spinnerRef = this.util.start();
    this.api.post_private('v1/admin/reels/' + item.id + '/duplicate', {}).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_status_updated');
        if (response && response.id) {
          this.router.navigate(['admin/reels/reel-form', response.id]);
        } else {
          this.getList();
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onDelete(item: AdminReelListItem) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_reel_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action && result.action == 'confirm') {
        const spinnerRef = this.util.start();
        this.api.delete_private('v1/admin/reels/' + item.id).subscribe({
          next: () => {
            this.util.stop(spinnerRef);
            this.getList();
          }, error: (error: any) => {
            this.util.stop(spinnerRef);
            this.util.handleError(error, 'admin');
          }
        });
      }
    });
  }

}
