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

@Component({
  selector: 'app-dialog-brand-certifications',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-brand-certifications.html',
})
export class DialogBrandCertifications {
  brand: any;
  certifications: any[] = [];
  types = [
    'authorization_letter',
    'dealership',
    'distributorship',
    'registration',
  ];

  loading = false;
  adding = false;
  saved = false;
  rejectingIndex: number | null = null;
  rejectionReason = '';
  form: any = this.blankForm();

  constructor(
    public dialogRef: MatDialogRef<DialogBrandCertifications>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.brand = data && data.values ? data.values : {};
    this.certifications = this.brand.certifications || [];
  }

  blankForm() {
    return {
      type: '',
      number: '',
      validFrom: null,
      validTo: null,
      document: '',
    };
  }

  typeKey(type: string): string {
    return 'stores_cert_' + type;
  }

  statusKey(status: string): string {
    return 'stores_brand_' + status;
  }

  validity(certification: any): string {
    const format = (value: any) =>
      value ? new Date(value).toLocaleDateString() : '—';
    if (!certification.validFrom && !certification.validTo) return '—';
    return format(certification.validFrom) + ' – ' + format(certification.validTo);
  }

  startAdd() {
    this.adding = true;
    this.form = this.blankForm();
  }

  cancelAdd() {
    this.adding = false;
    this.form = this.blankForm();
  }

  addCertification() {
    if (!this.form.type) return;

    this.loading = true;
    const payload: any = {
      type: this.form.type,
      number: this.form.number || undefined,
      validFrom: this.form.validFrom ? new Date(this.form.validFrom).toISOString() : undefined,
      validTo: this.form.validTo ? new Date(this.form.validTo).toISOString() : undefined,
      document: this.form.document || undefined,
    };

    this.api
      .post_private(
        'v1/admin/stores/catalog/brands/' + this.brand._id + '/certifications',
        payload,
      )
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.adding = false;
          this.form = this.blankForm();
          this.saved = true;
          this.applyBrand(response && response.brand ? response.brand : response);
          this.util.onSuccess(this.util.appTranslate('stores_brand_certification_saved'));
        },
        error: (error: any) => {
          this.loading = false;
          this.fail(error);
        },
      });
  }

  approve(index: number) {
    this.review(index, 'approved');
  }

  startReject(index: number) {
    this.rejectingIndex = index;
    this.rejectionReason = '';
  }

  cancelReject() {
    this.rejectingIndex = null;
    this.rejectionReason = '';
  }

  confirmReject(index: number) {
    this.review(index, 'rejected', this.rejectionReason);
  }

  private review(index: number, status: string, rejectionReason?: string) {
    this.loading = true;
    this.api
      .patch_private(
        'v1/admin/stores/catalog/brands/' +
          this.brand._id +
          '/certifications/' +
          index,
        {
          status,
          rejectionReason: rejectionReason || undefined,
        },
      )
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.rejectingIndex = null;
          this.rejectionReason = '';
          this.saved = true;
          this.applyBrand(response);
          this.util.onSuccess(this.util.appTranslate('stores_brand_certification_reviewed'));
        },
        error: (error: any) => {
          this.loading = false;
          this.fail(error);
        },
      });
  }

  private applyBrand(brand: any) {
    if (!brand) return;
    this.brand = { ...this.brand, ...brand };
    this.certifications = this.brand.certifications || [];
  }

  private fail(error: any) {
    const apiMessage =
      error && error.error && error.error.message ? error.error.message : '';
    if (apiMessage) {
      this.util.onError(apiMessage, '');
    } else {
      this.util.handleError(error, 'admin');
    }
  }

  onClose() {
    this.dialogRef.close({ event: this.saved ? 'update' : 'close' });
  }
}
