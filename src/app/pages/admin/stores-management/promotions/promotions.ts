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
 * Promotions — admin moderation (BR-22, §12.3).
 *
 * Promotions are partner-owned: a partner creates, sets discount shape and
 * applicability, and the admin gates the type against the chain's
 * `allowedPromotionTypes`. The admin does not author promotions (that would
 * make them platform-owned and bypass the chain's billing on the type), so
 * the only mutations here are approve/reject on the `approval` state.
 *
 * There is no pause/activate on the admin side either: the partner flips
 * `isActive` on their own console. Admin can reject at any time, which
 * sends the promotion back to the partner for revision.
 */
@Component({
  selector: 'app-stores-promotions',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './promotions.html',
})
export class Promotions extends StoresListBase {
  readonly APPROVALS = ['not_required', 'pending', 'approved', 'rejected'];

  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'promotions';
    this.listTitleKey = 'stores_promotions_list';
    this.displayedColumn = ['name', 'chain', 'type', 'value', 'window', 'usage', 'approval', 'action'];
  }

  override ngOnInit() {
    this.getList();
  }

  approvalFilter = '';

  override get extraQuery(): any {
    const q: any = {};
    if (this.statusFilter) q['status'] = this.statusFilter;
    if (this.approvalFilter) q['approvalStatus'] = this.approvalFilter;
    return q;
  }

  onApprovalFilter(value: string) {
    this.approvalFilter = value;
    this.currentPage = 0;
    this.getList();
  }

  /**
   * The backend re-reads the chain's `allowedPromotionTypes` and refuses
   * a type the chain is not permitted to create. That refusal is shown
   * verbatim, because "this chain may not create `buy_x_get_y`" is
   * actionable and a generic failure would not be.
   */
  isPending(row: any): boolean {
    return row.approval && row.approval.status === 'pending';
  }

  decide(row: any, status: 'approved' | 'rejected') {
    this.api
      .patch_private(`v1/admin/stores/promotions/${row._id}/moderate`, { status })
      .subscribe({
        next: () => {
          this.util.onSuccess(
            status === 'approved'
              ? this.util.appTranslate('stores_promotion_approved')
              : this.util.appTranslate('stores_promotion_rejected'),
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
