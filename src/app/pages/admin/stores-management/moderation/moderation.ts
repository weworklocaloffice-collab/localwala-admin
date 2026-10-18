import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Moderation: reviews, complaints and promotions.
 *
 * ## One screen, because the queue is one queue
 *
 * The abuse console already merges flagged reviews and open complaints into a single
 * ordered feed, because an operator triaging "is this partner a problem" does not care
 * which collection a report arrived in. This screen is where those rows are ACTIONED, so
 * it keeps them together rather than splitting them back apart.
 *
 * Promotions are here too because the action is the same shape — a moderation decision
 * that moves a record from pending to decided — and because BR-22's admin type gating is
 * applied at exactly this point.
 */
@Component({
  selector: 'app-stores-moderation',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './moderation.html',
})
export class Moderation implements OnInit {
  isLoaded = false;
  list: any[] = [];
  currentPage = 0;
  pageSize = 10;
  statusFilter = '';

  tab: 'reviews' | 'complaints' | 'promotions' = 'reviews';

  /**
   * The three tabs share one column set — subject, detail, status, action — and swap what
   * each cell renders rather than redefining the table. A per-tab column list would mean
   * three table definitions to keep in sync for a screen that is fundamentally one queue.
   */
  displayedColumn = ['subject', 'detail', 'status', 'action'];

  readonly TABS = [
    { key: 'reviews', path: 'reviews', labelKey: 'stores_reviews' },
    { key: 'complaints', path: 'complaints', labelKey: 'stores_complaints' },
    { key: 'promotions', path: 'promotions', labelKey: 'stores_promotions' },
  ];

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    private api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;

    let params = new HttpParams()
      .set('page', String(this.currentPage + 1))
      .set('limit', String(this.pageSize));
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    const path = this.TABS.find((t) => t.key === this.tab)?.path || 'reviews';
    this.api.get_private('v1/admin/stores/' + path + '?' + params.toString()).subscribe({
      next: (response: any) => {
        this.list = response && response.results ? response.results : [];
        if (this.paginator) {
          this.paginator.length = response && response.totalResults ? response.totalResults : 0;
          this.paginator.hidePageSize = !response || !response.totalResults;
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.list = [];
        this.util.handleError(error, 'admin');
      },
    });
  }

  onTab(tab: any) {
    this.tab = tab.key;
    // A status filter from the previous tab is usually not valid here — `flagged` is a
    // review status and means nothing on a promotion — so it is cleared rather than
    // silently returning an empty page.
    this.statusFilter = '';
    this.currentPage = 0;
    this.getList();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onStatusFilter(status: string) {
    this.statusFilter = status;
    this.currentPage = 0;
    this.getList();
  }

  statusesFor(tab: string): string[] {
    if (tab === 'reviews') return ['pending', 'approved', 'rejected', 'archived'];
    if (tab === 'complaints') return ['open', 'in_progress', 'resolved', 'closed', 'escalated'];
    return ['active', 'inactive', 'expired', 'archived'];
  }

  // -- reviews ---------------------------------------------------------------

  moderateReview(row: any, status: string) {
    this.api
      .patch_private('v1/admin/stores/reviews/' + row._id + '/moderate', { status })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_review_moderated');
          this.getList();
        },
        error: (error: any) => {
          const msg = error && error.error && error.error.message ? error.error.message : '';
          if (msg) {
            this.util.onError(msg, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }

  // -- complaints ------------------------------------------------------------

  /**
   * Closing a complaint REQUIRES a resolution.
   *
   * The backend refuses it too, but the check is repeated here so the operator is told
   * before the round trip rather than after — "close" is the button they will reach for
   * first and it is the one action that needs a value.
   */
  moderateComplaint(row: any, status: string) {
    if (status === 'resolved' && !row.resolution) {
      this.util.onError('stores_resolution_required', '');
      return;
    }

    const body: any = { status };
    if (row.resolution) body.resolution = row.resolution;

    this.api
      .patch_private('v1/admin/stores/complaints/' + row._id + '/moderate', body)
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_complaint_moderated');
          this.getList();
        },
        error: (error: any) => {
          const msg = error && error.error && error.error.message ? error.error.message : '';
          if (msg) {
            this.util.onError(msg, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }

  // -- promotions ------------------------------------------------------------

  /**
   * BR-22 admin type gating.
   *
   * The backend re-reads the chain's `allowedPromotionTypes` and refuses a type the chain
   * is not permitted to create. That refusal is shown verbatim, because "this chain may
   * not create `buy_x_get_y`" is actionable and a generic failure would not be.
   */
  moderatePromotion(row: any, status: string) {
    this.api
      .patch_private('v1/admin/stores/promotions/' + row._id + '/moderate', { status })
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_promotion_moderated');
          this.getList();
        },
        error: (error: any) => {
          const msg = error && error.error && error.error.message ? error.error.message : '';
          if (msg) {
            this.util.onError(msg, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }
}