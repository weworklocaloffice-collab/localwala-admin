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
 * POLICIES — read-only registry (§17.5).
 *
 * Backend exposes GET /policies only. Policies version: a new version
 * supersedes rather than edits, honouring `lockedFields` and the
 * product → category → store → platform resolution order (§6.10/§30).
 * Version creation is Phase-13 service work — so there is deliberately no
 * create/edit/toggle here.
 */
@Component({
  selector: 'app-stores-policies',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './policies.html',
})
export class Policies extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'policies';
    this.listTitleKey = 'stores_policies_list';
    this.displayedColumn = ['type', 'title', 'chain', 'outlet', 'isActive', 'version'];
  }

  override ngOnInit() {
    this.getList();
  }

  override get extraQuery(): any {
    const q: any = {};
    // The shared base sends every status filter as `status`; the model
    // field is `isActive`. Mapped in the backend validation + controller.
    if (this.statusFilter) q['status'] = this.statusFilter;
    return q;
  }
}
