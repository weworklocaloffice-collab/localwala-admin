/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Post-order requests: returns, exchanges, warranties.
 *
 * One screen because the backend is one list (`GET /requests?kind=`).
 * The decision offered here is approve/reject — the admin gate. Deeper
 * fulfilment moves (picked_up → received → refunded/exchanged, in_repair →
 * resolved) run partner-side through the same transition tables; an admin
 * forcing them from here would skip the inspection steps those states exist
 * to record.
 */
@Component({
  selector: 'app-stores-returns',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './returns.html',
})
export class Returns implements OnInit {
  isLoaded = false;
  list: any[] = [];
  currentPage = 0;
  pageSize = 10;
  statusFilter = '';

  kind: 'returns' | 'exchanges' | 'warranties' = 'returns';

  displayedColumn = ['order', 'outlet', 'reason', 'status', 'action'];

  readonly TABS = [
    { key: 'returns', labelKey: 'stores_returns' },
    { key: 'exchanges', labelKey: 'stores_exchanges' },
    { key: 'warranties', labelKey: 'stores_warranties' },
  ] as const;

  @ViewChild('paginator', { read: MatPaginator })
  paginator: MatPaginator;

  constructor(
    private api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  kindParam(): string {
    return this.kind === 'returns' ? 'return' : this.kind === 'exchanges' ? 'exchange' : 'warranty';
  }

  kindPath(): string {
    return this.kind === 'returns' ? 'returns' : this.kind === 'exchanges' ? 'exchanges' : 'warranties';
  }

  getList() {
    this.isLoaded = false;

    let params = new HttpParams()
      .set('page', String(this.currentPage + 1))
      .set('limit', String(this.pageSize))
      .set('kind', this.kindParam());
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.api.get_private('v1/admin/stores/requests?' + params.toString()).subscribe({
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

  onTab(key: 'returns' | 'exchanges' | 'warranties') {
    this.kind = key;
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

  statusesFor(): string[] {
    if (this.kind === 'returns') {
      return ['requested', 'approved', 'rejected', 'picked_up', 'received', 'refunded', 'cancelled'];
    }
    if (this.kind === 'exchanges') {
      return ['requested', 'approved', 'rejected', 'picked_up', 'received', 'exchanged', 'cancelled'];
    }
    return ['requested', 'approved', 'rejected', 'in_repair', 'resolved', 'closed', 'cancelled'];
  }

  canDecide(row: any): boolean {
    return row.status === 'requested';
  }

  decide(row: any, status: 'approved' | 'rejected') {
    this.api
      .patch_private(`v1/admin/stores/${this.kindPath()}/${row._id}/${status}`, {})
      .subscribe({
        next: () => {
          this.util.onSuccess('ts_stores_request_decided');
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
