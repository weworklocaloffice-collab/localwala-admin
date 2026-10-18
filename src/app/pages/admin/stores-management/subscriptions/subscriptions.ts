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
 * Store subscriptions — read-only register.
 *
 * One bill per chain (F1). Amounts arrive as rupees: the backend applies
 * money getters on this list, because subscription money is paise-stored.
 * Renewals, retries and suspension run in the subscription cron, not from
 * here; failing and at-risk subscriptions surface in the
 * subscription-health console with a retry action.
 */
@Component({
  selector: 'app-stores-subscriptions',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './subscriptions.html',
})
export class Subscriptions extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'subscriptions';
    this.listTitleKey = 'stores_subscriptions_list';
    this.displayedColumn = ['chain', 'status', 'amount', 'nextDue', 'trial'];
  }

  override ngOnInit() {
    this.getList();
  }

  override get extraQuery(): any {
    const q: any = {};
    if (this.statusFilter) q['status'] = this.statusFilter;
    return q;
  }
}
