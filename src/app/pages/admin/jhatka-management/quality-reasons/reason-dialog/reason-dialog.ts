import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../../jhatka-admin.service';

export interface ReasonDialogData {
  reason?: any;
  meta?: any;
}

@Component({
  selector: 'app-jhatka-reason-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './reason-dialog.html',
})
export class JhatkaReasonDialog {
  isSaving = false;
  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReasonDialogData,
    public dialogRef: MatDialogRef<JhatkaReasonDialog>,
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    public util: UtilService,
  ) {}

  get isEdit(): boolean {
    return !!this.data?.reason;
  }

  get meta(): any {
    return this.data?.meta || {};
  }

  get categories(): string[] {
    return this.meta?.categories || [];
  }

  get severities(): string[] {
    return this.meta?.severities || ['hard', 'soft'];
  }

  get faults(): string[] {
    return this.meta?.faults || ['supplier', 'transporter', 'outlet', 'unknown'];
  }

  get wastageCauses(): string[] {
    return this.meta?.wastageCauses || ['SPOILAGE', 'QUALITY_REJECTION', 'PACKAGING_DAMAGE', 'EXPIRY', 'OTHER'];
  }

  form = this.fb.group({
    code: [
      { value: this.data?.reason?.code || '', disabled: !!this.data?.reason },
      [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)],
    ],
    label: [this.data?.reason?.label || '', [Validators.required, Validators.maxLength(120)]],
    description: [this.data?.reason?.description || '', [Validators.maxLength(1000)]],
    category: [this.data?.reason?.category || '', [Validators.required]],
    severity: [this.data?.reason?.severity || 'soft', [Validators.required]],
    autoReject: [!!this.data?.reason?.autoReject],
    fault: [this.data?.reason?.fault || 'supplier'],
    wastageCause: [this.data?.reason?.wastageCause || 'QUALITY_REJECTION'],
    affectsSupplierRating: [this.data?.reason?.affectsSupplierRating !== false],
    sortOrder: [this.data?.reason?.sortOrder ?? 0],
    status: [this.data?.reason?.status !== false],
  });

  save() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value: any = this.form.getRawValue();
    const body: Record<string, any> = {
      label: String(value.label || '').trim(),
      description: String(value.description || '').trim(),
      category: value.category,
      severity: value.severity,
      autoReject: !!value.autoReject,
      fault: value.fault,
      wastageCause: value.wastageCause,
      affectsSupplierRating: !!value.affectsSupplierRating,
      sortOrder: Number(value.sortOrder) || 0,
      status: !!value.status,
    };
    if (!this.isEdit) {
      body['code'] = String(value.code || '').trim().toLowerCase();
    }

    this.isSaving = true;
    const id = this.admin.idOf(this.data?.reason);
    const request$ = this.isEdit
      ? this.admin.updateRejectionReason(id, body)
      : this.admin.createRejectionReason(body);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.util.onSuccess(this.isEdit ? 'jhatka_quality_reason_updated' : 'jhatka_quality_reason_created');
        this.dialogRef.close({ saved: true });
      },
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
