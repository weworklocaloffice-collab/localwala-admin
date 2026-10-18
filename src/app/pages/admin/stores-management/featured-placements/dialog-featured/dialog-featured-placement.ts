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
 * New featured-placement form.
 *
 * Field names match `StoreFeaturedPlacement`: outlet + chain (both
 * required — there is no `subjectType`/`subjectId`), optional product,
 * slot, startsAt/endsAt, amount (plain rupees). Status is the billing
 * lifecycle (pending_payment → paid → approved → live → expired), never a
 * boolean toggle — approval moves it, the UI does not flip it.
 *
 * NOTE: no backend POST exists yet (Phase-12 billing + approval service
 * work). Unwired until then; closes with the payload like the tax dialog.
 */
@Component({
  selector: 'app-dialog-featured-placement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-featured-placement.html',
})
export class DialogFeaturedPlacement {
  haveSubmitClicked: boolean = false;

  placementForm = new FormGroup({
    outlet: new FormControl('', [Validators.required]),
    chain: new FormControl('', [Validators.required]),
    product: new FormControl(''),
    slot: new FormControl('', [Validators.required]),
    startsAt: new FormControl('', [Validators.required]),
    endsAt: new FormControl('', [Validators.required]),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogFeaturedPlacement>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.placementForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.placementForm.invalid) {
      return;
    }
    this.dialogRef.close({ event: 'add', data: this.placementForm.value });
  }
}
