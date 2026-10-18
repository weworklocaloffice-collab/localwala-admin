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
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Stores import / export — placeholder, NOT wired.
 *
 * Doc §9 step 8 requires per-model `xxxSchemaArray` entries in
 * `API/src/utils/importCollectionSchema.js` plus `_empty.csv` / `_sample.csv`
 * / `.xlsx` templates, and §13 requires the `stores.import.templates` suite
 * (unknown brand column creates a REQUEST, never a brand — §5.7.7).
 * None of that backend exists yet, so a working upload screen would POST to
 * routes that 404. This placeholder renders the collection's sample assets
 * (static files under `src/assets/`) and refuses upload until the backend
 * lands — instead of the previous tiffin/food builder copy-paste, whose
 * timeslot/notice/variation logic belongs to another vertical entirely.
 */
@Component({
  selector: 'app-stores-import-export',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './import-export.html',
})
export class ImportExport {
  collectionName: string = '';
  displayName: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
  ) {
    this.collectionName = this.route.snapshot.paramMap.get('collection') ?? '';
    this.displayName = this.collectionName
      ? this.util.appTranslate(this.collectionName)
      : '';
  }
}
