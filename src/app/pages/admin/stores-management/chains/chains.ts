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
import { DialogSettlementSettings } from './dialog-settlement-settings/dialog-settlement-settings';

/**
 * CHAIN MANAGEMENT — registry plus settlement policy (BR-35, BR-36).
 *
 * Chains are still committed by the application-approval transaction: there is
 * no create/edit/toggle/archive here. The one write is the settlement policy
 * (`settings.settlementConfig`), because the generator cron reads it and it had
 * no writer anywhere. Chain `status` is a lifecycle string
 * (draft/active/suspended/…), not a boolean — hence no boolean status dropdown.
 */
@Component({
  selector: 'app-stores-chains',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './chains.html',
})
export class Chains extends StoresListBase {
  constructor(api: ApiService, util: UtilService, dialogRef: MatDialog) {
    super(api, util, dialogRef);
    this.path = 'chains';
    this.listTitleKey = 'stores_chains_list';
    this.displayedColumn = ['name', 'outletCount', 'status', 'settlement'];
  }

  override ngOnInit() {
    this.getList();
  }

  openSettlement(chain: any) {
    this.dialog.open(DialogSettlementSettings, {
      width: '480px',
      data: { chain },
    });
  }
}
