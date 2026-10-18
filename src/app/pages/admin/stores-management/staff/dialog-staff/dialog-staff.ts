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
 * New role-assignment form (BR-40).
 *
 * Field names match `StoreRoleAssignment`: user, chain, role, scopeType
 * (outlet/chain/business — there is no 'single'/'all'), outlets[] (required
 * and non-empty when scopeType is 'outlet', refused at the edge), status
 * (active/inactive/suspended — a string, not a boolean).
 *
 * NOTE: no backend POST/PATCH exists yet — assignment must revalidate outlet
 * scope server-side, which is service work, not an inline edit. Unwired
 * until then; closes with the payload like the tax dialog.
 */
@Component({
  selector: 'app-dialog-staff',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-staff.html',
})
export class DialogStaff {
  haveSubmitClicked: boolean = false;

  roles = [
    'owner',
    'manager',
    'order_manager',
    'inventory_manager',
    'dispatcher',
    'regional_manager',
    'staff',
  ];
  scopeTypes = ['outlet', 'chain', 'business'];
  statuses = ['active', 'inactive', 'suspended'];

  staffForm = new FormGroup({
    user: new FormControl('', [Validators.required]),
    chain: new FormControl('', [Validators.required]),
    role: new FormControl('', [Validators.required]),
    scopeType: new FormControl('outlet', [Validators.required]),
    outletIds: new FormControl(''),
    status: new FormControl('active'),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogStaff>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.staffForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.staffForm.invalid) {
      return;
    }
    const value: any = this.staffForm.value;
    if (value.scopeType === 'outlet' && !String(value.outletIds || '').trim()) {
      this.util.onError('stores_staff_outlets_required', '');
      return;
    }
    const payload = {
      user: value.user,
      chain: value.chain,
      role: value.role,
      scopeType: value.scopeType,
      outlets: String(value.outletIds || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s),
      status: value.status,
    };
    this.dialogRef.close({ event: 'add', data: payload });
  }
}
