/**
 * LocalWala - Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright (c) 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential. Unauthorized copying, redistribution, resale,
 * publication, modification, or use of this source code is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|ANGULAR
 */

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Merge a duplicate brand into a canonical, approved brand.
 *
 * The target search excludes the source row. The API moves products and requests,
 * unions aliases/taxonomy/certifications, and archives the duplicate; this dialog only
 * collects the target and an optional note.
 */
@Component({
  selector: 'app-dialog-brand-merge',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-brand-merge.html',
})
export class DialogBrandMerge {
  source: any;
  targets: any[] = [];
  targetQuery = '';
  selectedTarget: any = null;
  note = '';
  loading = false;
  searched = false;

  private searchTimer: any;
  private selecting = false;

  constructor(
    public dialogRef: MatDialogRef<DialogBrandMerge>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.source = data && data.values ? data.values : {};
  }

  ngOnInit() {
    this.loadTargets();
  }

  onTargetInput() {
    if (this.selecting) return;
    this.selectedTarget = null;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadTargets(), 250);
  }

  onTargetSelected(event: any) {
    this.selecting = true;
    this.selectedTarget = event && event.option ? event.option.value : null;
    if (this.selectedTarget) this.targetQuery = this.selectedTarget.name;
    setTimeout(() => (this.selecting = false));
  }

  loadTargets() {
    const query = String(this.targetQuery || '').trim();
    let url = 'v1/admin/stores/catalog/brands?status=approved&limit=20';
    if (query) url += '&search=' + encodeURIComponent(query);

    this.api.get_private(url).subscribe({
      next: (response: any) => {
        const rows = response && response.results ? response.results : [];
        this.targets = rows.filter(
          (brand: any) => String(brand._id) !== String(this.source._id),
        );
        this.searched = true;
      },
      error: (error: any) => {
        this.targets = [];
        this.searched = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmit() {
    if (!this.selectedTarget) {
      this.util.onError('stores_brand_merge_select_target', '');
      return;
    }

    this.loading = true;
    this.api
      .post_private('v1/admin/stores/catalog/brands/' + this.source._id + '/merge', {
        targetBrand: this.selectedTarget._id,
        note: this.note || undefined,
      })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.dialogRef.close({ event: 'merge', data: response });
        },
        error: (error: any) => {
          this.loading = false;
          const apiMessage =
            error && error.error && error.error.message ? error.error.message : '';
          if (apiMessage) {
            this.util.onError(apiMessage, '');
          } else {
            this.util.handleError(error, 'admin');
          }
        },
      });
  }
}
