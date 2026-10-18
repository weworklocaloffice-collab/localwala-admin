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
 * CHAIN MANAGEMENT — read-only registry (BR-35, BR-36).
 *
 * Backend exposes GET /chains (filter: business, status string, featured,
 * verified) and GET /chains/:chain only. There are no chain mutation routes:
 * chains are committed by the application-approval transaction, so there is
 * deliberately no create/edit/toggle/archive here. Chain `status` is a
 * lifecycle string (draft/active/suspended/…), not a boolean — hence no
 * boolean status dropdown either.
 */
@Component({
  selector: 'app-stores-chains',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './chains.html',
})
export class Chains extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'chains';
    this.listTitleKey = 'stores_chains_list';
    this.displayedColumn = ['name', 'outletCount', 'status'];
  }

  override ngOnInit() {
    this.getList();
  }
}
