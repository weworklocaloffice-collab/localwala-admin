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
 * Outlet config-edit form (future).
 *
 * Field names match `StoreOutlet`: outletCode is uppercase (`ABC-HYD-01`,
 * unique — not a lowercase slug), status is a lifecycle string (never a
 * boolean), tax identity is the nested `taxIdentity` object
 * (gstin/pan/legalName/stateCode), the invoice series is the nested
 * `invoiceSeries` object, and COD limits live under `deliveryConfig`.
 *
 * NOTE: outlets are committed by the application-approval transaction and
 * per-outlet config has no mutation route yet, so this is unwired until
 * then. Kept shape-correct for that day; closes with the payload like the
 * tax dialog.
 */
@Component({
  selector: 'app-dialog-outlet',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-outlet.html',
})
export class DialogOutlet {
  haveSubmitClicked: boolean = false;

  outletForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    outletCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Z0-9-]+$/),
    ]),
    gstin: new FormControl(''),
    pan: new FormControl(''),
    legalName: new FormControl(''),
    stateCode: new FormControl(''),
    invoicePrefix: new FormControl(''),
    invoiceFinancialYear: new FormControl(''),
    codEnabled: new FormControl(false),
    codMinOrder: new FormControl<number | null>(null, [Validators.min(0)]),
    codMaxOrder: new FormControl<number | null>(null, [Validators.min(0)]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogOutlet>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.outletForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.outletForm.invalid) {
      return;
    }
    const value: any = this.outletForm.value;
    this.dialogRef.close({
      event: 'add',
      data: {
        name: value.name,
        outletCode: value.outletCode,
        taxIdentity: {
          gstin: value.gstin || undefined,
          pan: value.pan || undefined,
          legalName: value.legalName || undefined,
          stateCode: value.stateCode || undefined,
        },
        invoiceSeries: {
          prefix: value.invoicePrefix || undefined,
          financialYear: value.invoiceFinancialYear || undefined,
        },
        deliveryConfig: {
          codEnabled: !!value.codEnabled,
          codMinOrder: value.codMinOrder,
          codMaxOrder: value.codMaxOrder,
        },
      },
    });
  }
}
