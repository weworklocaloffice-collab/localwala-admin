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

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Create/edit dialog for brands (§5.7).
 *
 * Field names match `brandCreate/Update`: name (slug is server-derived, so
 * there is no slug input to drift), aliases as comma text, categories as
 * ids, originCountry/website/description/logo, status. Approving without a
 * category is refused server-side (422) — and here first, before the round
 * trip. Certifications are Phase-13 verification work and are not collected
 * here.
 */
@Component({
  selector: 'app-dialog-brand',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-brand.html',
})
export class DialogBrand implements OnInit {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;
  categories: any[] = [];

  statuses = ['pending', 'approved', 'rejected'];

  brandForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    aliasesText: new FormControl(''),
    categories: new FormControl<string[]>([]),
    originCountry: new FormControl(''),
    website: new FormControl(''),
    description: new FormControl(''),
    logo: new FormControl(''),
    status: new FormControl('pending'),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogBrand>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.brandForm.patchValue({
        name: values.name,
        aliasesText: (values.aliases || []).join(', '),
        // List rows arrive with populated category objects; the select wants ids.
        categories: (values.categories || []).map((c: any) => (typeof c === 'string' ? c : c._id)),
        originCountry: values.originCountry || '',
        website: values.website || '',
        description: values.description || '',
        logo: values.logo || '',
        status: values.status || 'pending',
      });
    }
  }

  ngOnInit() {
    this.api.get_private('v1/admin/stores/catalog/categories?limit=200').subscribe({
      next: (response: any) => {
        this.categories = (response && response.results ? response.results : []).filter(
          (c: any) => c.status !== false,
        );
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  get f() {
    return this.brandForm.controls;
  }

  body() {
    const value: any = this.brandForm.value;
    const body: any = {
      name: value.name.trim(),
      aliases: String(value.aliasesText || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s),
      categories: value.categories || [],
    };
    if (value.originCountry) body.originCountry = value.originCountry;
    if (value.website) body.website = value.website;
    if (value.description) body.description = value.description;
    if (value.logo) body.logo = value.logo;
    if (this.action == 'edit' && value.status) body.status = value.status;
    if (this.action == 'create' && value.status && value.status !== 'pending') {
      body.status = value.status;
    }
    return body;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.brandForm.invalid) {
      return;
    }
    const value: any = this.brandForm.value;
    // Mirrors the service guard: an approved brand with no taxonomy has no
    // browse path, so it is refused — here first, not after the round trip.
    if (value.status === 'approved' && !(value.categories || []).length) {
      this.util.onError('stores_brand_category_required', '');
      return;
    }

    const base = 'v1/admin/stores/catalog/brands';
    const request =
      this.action == 'create'
        ? this.api.post_private(base, this.body())
        : this.api.patch_private(base + '/' + this.id, this.body());

    request.subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: this.action == 'create' ? 'add' : 'update', data: response });
      },
      error: (error: any) => {
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
