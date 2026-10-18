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
import { DialogStoresSubcategory } from '../dialog-taxonomy/dialog-taxonomy';
import { Brands } from '../brands/brands';

/**
 * Subcategories (BR-10, Admin-configurable).
 *
 * Same tab contract as Categories: the Brands tab embeds the standalone
 * Brands page. Archive / status-toggle are inherited from the base
 * (`v1/admin/stores/catalog/`, archive semantics per BR-25).
 */
@Component({
  selector: 'app-stores-subcategories',
  imports: [CommonModule, FormsModule, MaterialModule, Brands],
  templateUrl: './subcategories.html',
})
export class SubCategories extends StoresTaxonomyBase {
  activeTab: 'subcategories' | 'brands' = 'subcategories';

  constructor(
    api: ApiService,
    util: UtilService,
    public override dialogRef: MatDialog,
  ) {
    super(api, util, dialogRef);
    this.path = 'subcategories';
    this.listTitleKey = 'stores_subcategories_list';
    this.displayedColumn = ['name', 'category', 'sortOrder', 'status', 'action'];
    this.dialog = DialogStoresSubcategory;
    this.addedKey = 'ts_stores_subcategory_added';
    this.updatedKey = 'ts_stores_subcategory_updated';
    this.archivedKey = 'ts_stores_subcategory_archived';
  }

  override ngOnInit() {
    this.getList();
  }

  get isSubcategoriesTab() {
    return this.activeTab === 'subcategories';
  }

  get isBrandsTab() {
    return this.activeTab === 'brands';
  }

  onTabChange(tab: 'subcategories' | 'brands') {
    this.activeTab = tab;
    if (tab === 'subcategories') {
      this.getList();
    }
  }
}
