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
import { StoresTaxonomyBase } from '../taxonomy-base';
import { DialogStoresCategory } from '../dialog-taxonomy/dialog-taxonomy';
import { Brands } from '../brands/brands';

/**
 * Store categories. BR-10 makes these Admin-configurable, so this is the screen that
 * actually discharges that rule — the 20 seeded rows are just the initial state.
 *
 * BR-49: Categories and Brands share the same screen via a tabbed interface
 * (doc §5.7.3, category-first workflow). The Brands tab embeds the standalone
 * Brands page, which owns its own list; brand create/edit stays deferred there
 * (multi-field form: taxonomy + certification) rather than shipped as a stub.
 *
 * Archive / status-toggle come from the base: the endpoint is a DELETE that
 * archives (BR-25), under `v1/admin/stores/catalog/`.
 */
@Component({
  selector: 'app-stores-categories',
  imports: [CommonModule, FormsModule, MaterialModule, Brands],
  templateUrl: './categories.html',
})
export class Categories extends StoresTaxonomyBase {
  activeTab: 'categories' | 'brands' = 'categories';

  constructor(
    api: ApiService,
    util: UtilService,
    public override dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'categories';
    this.listTitleKey = 'stores_categories_list';
    this.displayedColumn = ['name', 'key', 'icon', 'sortOrder', 'status', 'action'];
    this.dialog = DialogStoresCategory;
    this.addedKey = 'ts_stores_category_added';
    this.updatedKey = 'ts_stores_category_updated';
    this.archivedKey = 'ts_stores_category_archived';
  }

  override ngOnInit() {
    this.getList();
  }

  get isCategoriesTab() {
    return this.activeTab === 'categories';
  }

  get isBrandsTab() {
    return this.activeTab === 'brands';
  }

  onTabChange(tab: 'categories' | 'brands') {
    this.activeTab = tab;
    if (tab === 'categories') {
      this.getList();
    }
  }
}
