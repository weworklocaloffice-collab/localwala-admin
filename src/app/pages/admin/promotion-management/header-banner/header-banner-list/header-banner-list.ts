import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ConfirmDialog } from 'src/app/ui-components/confirm-dialog/confirm-dialog';
import { AdminHeaderBannerListInterface } from 'src/app/interfaces/admin.header.banner.interface';

/**
 * Header banner list — priority ordered, with schedule status badges.
 *
 * Reads `v1/admin/header-banner/`, the dedicated module, not the legacy
 * `v1/admin/banners/getAll` collection.
 */
@Component({
  selector: 'app-header-banner-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './header-banner-list.html',
})
export class HeaderBannerList {
  /** Emitted when an operator opens a banner, so the parent can bind the form tabs. */
  @Output() selected = new EventEmitter<AdminHeaderBannerListInterface>();

  /** Emitted after any create, publish or delete so the parent can refresh chrome. */
  @Output() changed = new EventEmitter<void>();

  /** Emitted by the history button, so the parent can land on the history tab. */
  @Output() historySelected = new EventEmitter<AdminHeaderBannerListInterface>();

  /** Emitted by "Add New Banner", so the parent can reset the form. */
  @Output() createNew = new EventEmitter<void>();

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;

  /**
   * Row count from the last response, held separately from the paginator.
   *
   * `paginator` is a ViewChild, so it does not exist until the view initialises - and
   * this tab's content is rendered lazily inside the tab group, which means the response
   * can land while it is still undefined. Writing `.length` on it then threw
   * "Cannot set properties of undefined". Keeping the count here and pushing it to the
   * paginator in `ngAfterViewInit` makes the ordering irrelevant.
   */
  private totalResults = 0;

  banners = new MatTableDataSource<AdminHeaderBannerListInterface>([]);
  displayedColumn = ['campaign', 'media', 'schedule', 'priority', 'status', 'action'];
  pageSize: number = 10;
  currentPage: number = 0;
  isLoaded: boolean = false;
  searchQuery: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.getList();
  }

  /**
   * Pushes the held row count onto the paginator, if it exists yet.
   *
   * Safe to call repeatedly: the constructor fires the request before the view exists,
   * and `ngAfterViewInit` re-applies whatever count arrived in the meantime.
   */
  private applyPaginator(): void {
    if (!this.paginator) return;
    this.paginator.length = this.totalResults;
    this.paginator.hidePageSize = this.totalResults <= this.pageSize;
  }

  ngAfterViewInit(): void {
    this.applyPaginator();
  }

  getList(): void {
    this.isLoaded = false;
    const httpParams = new HttpParams()
      .set('limit', this.pageSize)
      .set('page', this.currentPage)
      .set('search', this.searchQuery ?? '');
    this.api.get_private('v1/admin/header-banner/?' + httpParams.toString()).subscribe({
      next: (response: any) => {
        this.isLoaded = true;
        if (response && response.results) {
          this.banners = new MatTableDataSource<AdminHeaderBannerListInterface>(response.results);
          this.totalResults = response.totalResults ?? 0;
          this.applyPaginator();
        }
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.getList();
  }

  onStatusChange(event: MatSlideToggleChange, banner: AdminHeaderBannerListInterface): void {
    const next = event.checked;
    banner.status = next;
    this.api.patch_private(`v1/admin/header-banner/${banner.id}/status`, { status: next }).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        // Revert. The row was flipped optimistically, so a failed request left the
        // toggle showing a state the server never accepted.
        banner.status = !next;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onAdd(): void {
    // `changed` only asks the parent to refresh the list, so the "Add New Banner"
    // button used to refresh and stop there. It needs its own output to reach the
    // form reset.
    this.createNew.emit();
  }

  onEdit(item: AdminHeaderBannerListInterface): void {
    console.warn('[HB] list onEdit ->', item?.id, item?.campaignName);
    this.selected.emit(item);
  }

  onHistory(item: AdminHeaderBannerListInterface): void {
    this.historySelected.emit(item);
  }

  onDelete(item: AdminHeaderBannerListInterface): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'ts_are_you_sure', subTitle: 'ts_banner_will_removed_instruction', okTitle: 'ts_yes_delete_it', closeTitle: 'ts_cancel' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action !== 'confirm') return;
      const spinnerRef = this.util.start();
      this.api.delete_private(`v1/admin/header-banner/${item.id}`).subscribe({
        next: () => {
          this.util.stop(spinnerRef);
          this.getList();
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        },
      });
    });
  }

  mediaPreview(item: AdminHeaderBannerListInterface): string {
    const path = item?.image || item?.mediaUrl;
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // The media base is stored with a trailing slash and the API paths carry a
    // leading one. Joining them literally produced `//`, which S3 answers with 403,
    // so every preview silently rendered blank.
    const base = (this.api.mediaUrl || '').trim().replace(/\/+$/, '');
    const suffix = path.trim().replace(/^\/+/, '');
    return base ? `${base}/${suffix}` : '';
  }

  /** `global` when the banner has no city, matching the server's nullable `city`. */
  scopeLabel(item: AdminHeaderBannerListInterface): string {
    const city: any = item?.city;
    if (!city) return 'global';
    return city.displayName || city.name || 'global';
  }

  /** Active / Scheduled / Inactive, derived from the same window the server applies. */
  scheduleLabel(item: AdminHeaderBannerListInterface): string {
    if (!item?.status) return 'inactive';
    const now = new Date();
    const start = item.startDate ? new Date(item.startDate) : null;
    const end = item.endDate ? new Date(item.endDate) : null;
    if (item.scheduleType === 'dateRange' || start || end) {
      if (start && now < start) return 'scheduled';
      if (end && now > end) return 'inactive';
    }
    return 'active';
  }
}