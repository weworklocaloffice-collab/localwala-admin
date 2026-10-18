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
 * Refund register — read-only (BR-28, BR-33).
 *
 * Refunds are component-based and created by the cancellation/return flows,
 * never by hand from this screen: a hand-written refund could double-refund
 * a component the ceiling accounting already closed. Failed gateway refunds
 * surface in the refund-failures console with their gateway error.
 */
@Component({
  selector: 'app-stores-refunds',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './refunds.html',
})
export class Refunds extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'refunds';
    this.listTitleKey = 'stores_refunds_list';
    this.displayedColumn = ['order', 'outlet', 'component', 'amount', 'funding', 'status'];
  }

  override ngOnInit() {
    this.getList();
  }
}
