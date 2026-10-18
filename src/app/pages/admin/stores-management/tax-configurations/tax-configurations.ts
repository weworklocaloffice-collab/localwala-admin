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
 * TAX CONFIGURATIONS — read-only GST rate table (BR-41).
 *
 * Backend: `GET /v1/admin/stores/tax-configurations` answers
 * `{ taxConfigurations, total, page, limit }` filtered by `code` + `status`.
 * There is deliberately no POST/PATCH here: a rate change is a NEW
 * effective-dated row, never an in-place edit of history (§6.24).
 * Rates are seeded (doc §17.1); Admin creation waits on a backend POST.
 */
@Component({
  selector: 'app-stores-tax-configurations',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './tax-configurations.html',
})
export class TaxConfigurations extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'tax-configurations';
    this.listTitleKey = 'stores_tax_configurations_list';
    this.displayedColumn = [
      'code',
      'gstRate',
      'effectiveFrom',
      'effectiveTo',
      'isDefault',
      'status',
    ];
  }

  override get extraQuery(): any {
    const q: any = {};
    // Backend filters on `code` (HSN/SAC, uppercased server-side).
    if (this.searchQuery) q['code'] = this.searchQuery;
    if (this.statusFilter) q['status'] = this.statusFilter;
    return q;
  }
}
