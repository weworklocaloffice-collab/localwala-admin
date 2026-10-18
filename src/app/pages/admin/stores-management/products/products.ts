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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { StoresListBase } from '../stores-list-base';

/**
 * Products — admin read + approval (BR-09, §5.6).
 *
 * Catalog writes (create / update / archive / variant generation) are
 * partner-only and live on the partner surface — the admin screen does
 * not duplicate them, because a hand-edited admin product would skip the
 * chain-scope guard and could be filed under the wrong chain (the entire
 * reason approval exists).
 *
 * The admin path is approve or reject: when a chain has
 * `productApprovalRequired`, every new product lands in
 * `approval.status = 'pending'`. Approve flips it to 'approved' and the
 * product goes live. Reject leaves the catalogue status alone so the
 * partner can revise and resubmit.
 */
@Component({
  selector: 'app-stores-products',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './products.html',
})
export class Products extends StoresListBase {
  readonly STATUSES = ['active', 'inactive', 'archived'];
  readonly APPROVALS = ['not_required', 'pending', 'approved', 'rejected'];

  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    // Admin catalog route is mounted at /v1/admin/stores/catalog, not the
    // generic /v1/admin/stores base. The base path is what the template
    // call concatenates to.
    this.path = 'catalog/products';
    this.listTitleKey = 'stores_products_list';
    this.displayedColumn = ['name', 'chain', 'category', 'brand', 'price', 'status', 'approval', 'action'];
  }

  override ngOnInit() {
    this.getList();
  }

  override get extraQuery(): any {
    const q: any = {};
    if (this.statusFilter) q['status'] = this.statusFilter;
    if (this.approvalFilter) q['approval'] = this.approvalFilter;
    return q;
  }

  approvalFilter = '';

  onApprovalFilter(value: string) {
    this.approvalFilter = value;
    this.currentPage = 0;
    this.getList();
  }

  /** Approval queue: every row whose `approval.status` is 'pending'. */
  isPending(row: any): boolean {
    return row.approval && row.approval.status === 'pending';
  }

  /**
   * Approve / reject. Backend is the state-machine authority; the UI sends
   * the desired state and trusts the response.
   */
  decide(row: any, status: 'approved' | 'rejected') {
    this.api
      .patch_private('v1/admin/stores/catalog/products/' + row._id + '/approval', { status })
      .subscribe({
        next: () => {
          this.util.onSuccess(
            status === 'approved'
              ? this.util.appTranslate('stores_product_approved')
              : this.util.appTranslate('stores_product_rejected'),
          );
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
