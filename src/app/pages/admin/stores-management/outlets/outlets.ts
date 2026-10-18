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
 * OUTLET MANAGEMENT — read-only registry (§17.5).
 *
 * Backend exposes GET /outlets only. Outlets are committed by the
 * application-approval transaction, never created by hand, and per-outlet
 * config (taxIdentity object, invoiceSeries object, deliveryConfig COD
 * limits) has no mutation route yet — so there is deliberately no
 * create/edit/toggle here. Outlet `status` is a lifecycle string, not a
 * boolean, and COD/invoice fields are nested objects, not flat columns.
 */
@Component({
  selector: 'app-stores-outlets',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './outlets.html',
})
export class Outlets extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'outlets';
    this.listTitleKey = 'stores_outlets_list';
    this.displayedColumn = ['outletCode', 'name', 'chain', 'status', 'codEnabled', 'invoiceSeries'];
  }

  override ngOnInit() {
    this.getList();
  }
}
