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

import { Component, Inject } from '@angular/core';
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
 * New GST rate version dialog (BR-41).
 *
 * There is NO edit path on purpose: a rate change is a NEW effective-dated
 * row, never an in-place PATCH of history (§6.24). Historical order lines
 * carry frozen snapshots; mutating the table would rewrite them.
 *
 * NOTE: backend has no POST /tax-configurations yet (only GET list +
 * GET /resolve). This dialog is unwired until that route lands; rates are
 * seeded per doc §17.1. Kept compilable and field-correct for that day.
 */
@Component({
  selector: 'app-dialog-tax-configuration',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-tax-configuration.html',
})
export class DialogTaxConfiguration {
  haveSubmitClicked: boolean = false;

  taxConfigForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    gstRate: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    effectiveFrom: new FormControl('', [Validators.required]),
    effectiveTo: new FormControl(''),
    isDefault: new FormControl(false),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogTaxConfiguration>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.taxConfigForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.taxConfigForm.invalid) {
      return;
    }
    // Unwired: no backend POST /tax-configurations exists yet.
    // Close with the payload so the caller can wire it when the route lands.
    this.dialogRef.close({ event: 'add', data: this.taxConfigForm.value });
  }
}
