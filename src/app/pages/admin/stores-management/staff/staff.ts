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
 * STORE ROLE ASSIGNMENT — read-only registry (BR-40, §17.5).
 *
 * Backend exposes GET /staff only. Assigning or changing a role must
 * revalidate outlet scope server-side (an outlet-scoped role with an empty
 * outlets[] is refused at the edge), which is service work, not an admin
 * inline edit — so there is deliberately no create/edit/toggle here.
 */
@Component({
  selector: 'app-stores-staff',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './staff.html',
})
export class Staff extends StoresListBase {
  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'staff';
    this.listTitleKey = 'stores_staff_list';
    this.displayedColumn = ['user', 'role', 'scopeType', 'outlets', 'status'];
  }

  override ngOnInit() {
    this.getList();
  }
}
