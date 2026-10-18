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
 * Inventory — admin read (cross-tenant).
 *
 * Stock counts are integers (BR-12) so the 100x-money-bug class does not
 * apply. Movements are paise-adjacent only on the rare monetary `amount`
 * field, which this console does not show.
 *
 * The admin cannot adjust stock from here: stock writes must revalidate
 * outlet scope (BR-38), which is service work on the partner side. A
 * partner on the floor uses their own console; the admin's surface is
 * observe + flag (the inventory-drift console is the operational view).
 */
@Component({
  selector: 'app-stores-inventory',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './inventory.html',
})
export class Inventory extends StoresListBase {
  /** One screen, two tabs: current stock and recent movements. */
  tab: 'stock' | 'movements' = 'stock';

  constructor(
    api: ApiService,
    util: UtilService,
    dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'catalog/inventory/stock';
    this.listTitleKey = 'stores_inventory_list';
    this.displayedColumn = ['outlet', 'product', 'variant', 'onHand', 'reserved', 'available', 'lowStock'];
  }

  override ngOnInit() {
    this.getList();
  }

  /** Switching tabs re-roots the path; the base concatenates /v1/admin/stores/. */
  override get extraQuery(): any {
    const q: any = {};
    if (this.statusFilter === 'low') q['lowOnly'] = 'true';
    return q;
  }

  onTab(tab: 'stock' | 'movements') {
    this.tab = tab;
    // Path under the admin catalog base. Movements live at a different
    // endpoint; switching tabs re-reads from the new path.
    this.path = tab === 'stock' ? 'catalog/inventory/stock' : 'catalog/inventory/movements';
    this.displayedColumn =
      tab === 'stock'
        ? ['outlet', 'product', 'variant', 'onHand', 'reserved', 'available', 'lowStock']
        : ['product', 'variant', 'type', 'quantity', 'before', 'after', 'createdAt'];
    this.currentPage = 0;
    this.getList();
  }

  /** Free-form filter used as `lowOnly=true` for the low-stock tab. */
  override statusFilter = '';

  onLowFilter(value: string) {
    this.statusFilter = value;
    this.currentPage = 0;
    this.getList();
  }
}
