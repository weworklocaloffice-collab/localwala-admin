import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Platform-wide order list for admins.
 *
 * ## Cross-tenant on purpose
 *
 * Every other order screen in this panel is outlet-scoped. This one is not, because an
 * admin investigating a dispute needs the order regardless of which chain placed it — the
 * whole point of the screen is to see an order that is wrong across a boundary.
 *
 * ## Actions come from the LIFECYCLE, not from a dropdown
 *
 * The legal moves are a server-side transition table with guards. This screen renders the
 * moves that are legal from the row's current state and nothing else. A status dropdown
 * would offer `cancelled` on a `completed` order, the operator would commit, and the
 * server would refuse — after they believed it was done.
 */
@Component({
  selector: 'app-stores-orders',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  isLoaded = false;
  list: any[] = [];
  currentPage = 0;
  pageSize = 10;
  searchQuery = '';
  lifecycleFilter = '';

  /** Column order for `mat-table`. Declared here because the template binds it. */
  displayedColumn = ['orderNo', 'outlet', 'customer', 'total', 'lifecycle', 'action'];

  /** Every lifecycle in the transition table, for the filter dropdown. */
  readonly LIFECYCLES = [
    'created',
    'payment_pending',
    'paid',
    'store_received',
    'accepted',
    'picking',
    'packing',
    'ready',
    'driver_assigned',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'completed',
    'rejected',
    'cancelled',
    'payment_failed',
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
    if (this.searchQuery) params = params.set('search', this.searchQuery);
    if (this.lifecycleFilter) params = params.set('lifecycle', this.lifecycleFilter);

    this.api.get_private('v1/admin/stores/orders?' + params.toString()).subscribe({
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

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
  }

  onSearch() {
    this.currentPage = 0;
    this.getList();
  }

  onLifecycleFilter(lifecycle: string) {
    this.lifecycleFilter = lifecycle;
    this.currentPage = 0;
    this.getList();
  }

  /**
   * The moves legal from a given state.
   *
   * Mirrors the server table. A divergence here is not dangerous — the server still
   * refuses — but it would show an operator a dead action, which is the thing this screen
   * exists to avoid. The server table remains the authority.
   */
  actionsFor(row: any): string[] {
    const table: { [key: string]: string[] } = {
      created: ['payment_pending', 'cancelled'],
      payment_pending: ['paid', 'payment_failed', 'cancelled'],
      paid: ['store_received', 'cancelled'],
      store_received: ['accepted', 'rejected', 'cancelled'],
      accepted: ['picking', 'cancelled'],
      picking: ['packing', 'cancelled'],
      packing: ['ready', 'cancelled'],
      ready: ['driver_assigned', 'cancelled'],
      driver_assigned: ['picked_up', 'cancelled'],
      picked_up: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: ['completed'],
      completed: [],
      rejected: [],
      cancelled: [],
      payment_failed: ['payment_pending', 'cancelled'],
    };
    return table[row.lifecycle] || [];
  }

  /**
   * `cancelled` is styled as the destructive move and every other one as routine, so a
   * glance at a row distinguishes "advance this order" from "kill this order".
   */
  isDestructive(action: string): boolean {
    return action === 'cancelled' || action === 'rejected' || action === 'payment_failed';
  }

  transition(row: any, status: string) {
    this.api
      .patch_private('v1/admin/stores/orders/' + row._id + '/' + status, {})
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_order_updated');
          this.getList();
        },
        error: (error: any) => {
          const apiMessage =
            error && error.error && error.error.message ? error.error.message : '';
          // The transition table's refusal explains what IS allowed, which is more useful
          // than the generic handler text.
          if (apiMessage) {
            this.util.onError(apiMessage, '');
          } else {
            this.util.handleError(error, 'admin');
          }
          this.getList();
        },
      });
  }

  /** Orders with no action available read as terminal — say so, do not show nothing. */
  isTerminal(row: any): boolean {
    return this.actionsFor(row).length === 0;
  }
}