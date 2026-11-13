/**
 * LocalWala - Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright c 2026 WeWorkLocal Private Limited
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
import { HttpParams } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Stores taxonomy import / export.
 *
 * Backed by the Live endpoints under `v1/admin/stores/catalog`:
 *
 *   POST import/:collection   CSV or XLSX, header must match the template exactly
 *   GET  export/:collection   csv | excel | raw
 *
 * The templates are generated from the same schema arrays the importer checks, so
 * the sample a user downloads is by construction a file the importer will accept.
 * Uploads are all-or-nothing: a bad row rejects the file before any write. Counts
 * in the success toast come from the server, not from the client's row count.
 *
 * An unknown brand category is a row error here. That is deliberate - brand
 * requests from the product import (5.7.7) are a different flow and never create
 * taxonomy silently.
 */
@Component({
  selector: 'app-stores-import-export',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './import-export.html',
})
export class ImportExport {
  collectionName = '';
  displayName = '';
  uploadURL = '';
  sampleExcel = '';
  emptyExcel = '';
  sampleCSV = '';
  emptyCSV = '';

  downloadFile = '';
  uploadType: 'excel' | 'csv' = 'excel';
  fileTarget: File | null = null;
  uploadFileName = '';
  exportType: 'csv' | 'excel' | 'raw' = 'csv';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
  ) {
    this.collectionName = this.route.snapshot.paramMap.get('collection') ?? '';
    const entry = this.util.collectionNames.find((x) => x.key === this.collectionName);

    if (!entry) {
      this.util.onError('ts_something_went_wrong', '');
      return;
    }

    this.displayName = entry.name;
    this.sampleExcel = entry.sampleExcel;
    this.emptyExcel = entry.emptyExcel;
    this.sampleCSV = entry.sampleCSV;
    this.emptyCSV = entry.emptyCSV;
    this.uploadURL = entry.uploadLink;
  }

  get isKnownCollection(): boolean {
    return !!this.uploadURL;
  }

  get canImport(): boolean {
    return this.util.hasRight('stores_taxonomy_write');
  }

  onDownload() {
    if (!this.downloadFile) {
      return;
    }

    const params = new HttpParams().set('link', this.downloadFile);
    const spinnerRef = this.util.start();

    this.api.export_collection('v1/admin/download_import_sample?' + params.toString()).subscribe({
      next: (blob: Blob) => {
        this.util.stop(spinnerRef);
        const downloadType = this.downloadFile.includes('xlsx') ? 'excel' : 'csv';
        const downloadKind = this.downloadFile.includes('sample') ? 'sample' : 'empty';
        const fileName =
          downloadType === 'excel'
            ? `${this.collectionName}_${downloadKind}.xlsx`
            : `${this.collectionName}_${downloadKind}.csv`;
        this.api.download_export_file(blob, fileName);
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    this.fileTarget = file ?? null;
    this.uploadFileName = file?.name ?? '';
  }

  uploadCollection() {
    if (!this.fileTarget || !this.uploadURL) {
      return;
    }

    const extension = this.fileTarget.name.split('.').pop()?.toLowerCase();
    const expected = this.uploadType === 'excel' ? 'xlsx' : 'csv';
    if (extension !== expected) {
      this.util.onError('ts_something_went_wrong', '');
      return;
    }

    const spinnerRef = this.util.start('ts_uploading');
    this.api.importCollection(this.fileTarget, this.uploadType, this.uploadURL).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.util.onSuccess(
            `${this.displayName}: ${response.created} created, ${response.updated} updated`,
          );
          this.fileTarget = null;
          this.uploadFileName = '';
        }
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onExport() {
    if (!this.uploadURL) {
      return;
    }

    const spinnerRef = this.util.start();
    const url = `v1/admin/stores/catalog/export/${this.collectionName}?type=${this.exportType}`;

    this.api.export_collection(url).subscribe({
      next: (blob: Blob) => {
        this.util.stop(spinnerRef);
        const extension = this.exportType === 'excel' ? 'xlsx' : this.exportType;
        this.api.download_export_file(blob, `${this.collectionName}_export.${extension}`);
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }
}
