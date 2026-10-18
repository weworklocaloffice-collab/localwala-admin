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
 * New policy-version form.
 *
 * Field names match `StorePolicy`: chain (required), outlet (absent =
 * chain default), type (the 7-value enum — there is no 'return-refund' or
 * 'organic-verification'), title, content, effectiveFrom/To. A new version
 * supersedes rather than edits, honouring `lockedFields` (§30) — so there
 * is no edit path, and no version/isActive inputs (server-owned).
 *
 * NOTE: no backend POST exists yet (Phase-13 service work). Unwired until
 * then; closes with the payload like the tax dialog.
 */
@Component({
  selector: 'app-dialog-policy',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-policy.html',
})
export class DialogPolicy {
  haveSubmitClicked: boolean = false;

  types = ['return', 'exchange', 'warranty', 'cancellation', 'delivery', 'privacy', 'terms'];

  policyForm = new FormGroup({
    chain: new FormControl('', [Validators.required]),
    outlet: new FormControl(''),
    type: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    effectiveFrom: new FormControl(''),
    effectiveTo: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogPolicy>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.policyForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.policyForm.invalid) {
      return;
    }
    this.dialogRef.close({ event: 'add', data: this.policyForm.value });
  }
}
