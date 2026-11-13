import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { JhatkaAdminService } from '../../jhatka-admin.service';
import { JhatkaProduct, JhatkaVariant } from '../../jhatka.models';

export interface VariantDialogData {
  variant?: JhatkaVariant;
  products: JhatkaProduct[];
}

@Component({
  selector: 'app-jhatka-variant-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './variant-dialog.html',
  styles: [
    `
      .dialog-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 14px;
        padding-top: 10px;
      }
      .span-2 {
        grid-column: 1 / -1;
      }
      .dialog-grid mat-form-field {
        width: 100%;
      }
      .edit-note {
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        margin-bottom: 8px;
      }
      .media-card {
        border: 1px dashed var(--mat-sys-outline);
        border-radius: 12px;
        padding: 10px;
        cursor: pointer;
        background: var(--mat-sys-surface-container-lowest);
      }
      .media-preview {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
        background: var(--mat-sys-surface-container-high);
      }
      .media-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
      }
      .media-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-top: 1px solid var(--mat-sys-outline-variant);
        margin-top: 8px;
      }
      .toggle-copy {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 2px;
        max-width: 520px;
      }
      @media (max-width: 600px) {
        .dialog-grid {
          grid-template-columns: 1fr;
        }
        .span-2 {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class JhatkaVariantDialog {
  isSaving = false;
  submitted = false;
  readonly unitLabels = ['kg', 'g', 'pc', 'dozen', 'tier', 'piece'];
  readonly packUnits = ['GRAM', 'KG', 'PIECE', 'DOZEN', 'TIER', 'PACK'];
  readonly availabilityUnits = ['KG', 'GRAM', 'PIECE', 'DOZEN', 'TIER', 'PACK'];
  readonly priceBases = ['per_kg', 'per_piece', 'per_dozen', 'per_pack'];

  form = this.fb.group({
    product: [
      { value: this.productId, disabled: !!this.data.variant },
      [Validators.required],
    ],
    sku: [
      { value: this.data.variant?.sku || '', disabled: !!this.data.variant },
      [Validators.required, Validators.maxLength(60)],
    ],
    name: [this.data.variant?.name || '', [Validators.required, Validators.maxLength(140)]],
    measurementMode: [
      { value: this.data.variant?.measurementMode || 'WEIGHT', disabled: !!this.data.variant },
      [Validators.required],
    ],
    unitLabel: [
      { value: this.data.variant?.unitLabel || 'kg', disabled: !!this.data.variant },
      [Validators.required],
    ],
    priceBasis: [this.data.variant?.priceBasis || 'per_kg', [Validators.required]],
    pricePerUnit: [
      this.data.variant ? Number(this.data.variant.pricePerUnit || 0) / 100 : null,
      [Validators.required, Validators.min(0)],
    ],
    packValue: [
      { value: this.data.variant?.packSize?.value ?? 1, disabled: !!this.data.variant },
      [Validators.required, Validators.min(0.001)],
    ],
    packUnit: [
      { value: this.data.variant?.packSize?.unit || 'KG', disabled: !!this.data.variant },
      [Validators.required],
    ],
    availabilityUnit: [this.data.variant?.availabilityUnit || 'KG'],
    estimatedAvailability: [this.data.variant?.estimatedAvailability ?? 0, [Validators.min(0)]],
    subscriptionCeilingPct: [this.data.variant?.subscriptionCeilingPct ?? 10, [Validators.min(0), Validators.max(100)]],
    subscriptionEligible: [this.data.variant?.subscriptionEligible !== false],
    sortOrder: [this.data.variant?.sortOrder ?? 0],
    image: [this.data.variant?.image || ''],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VariantDialogData,
    public dialogRef: MatDialogRef<JhatkaVariantDialog>,
    public appApi: ApiService,
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  get isEdit(): boolean {
    return !!this.data.variant;
  }

  get productId(): string {
    return this.admin.idOf(this.data.variant?.product);
  }

  onMeasurementChange() {
    if (this.isEdit) {
      return;
    }
    const mode = this.form.get('measurementMode')?.value;
    if (mode === 'COUNT') {
      this.form.patchValue({
        priceBasis: 'per_piece',
        unitLabel: 'pc',
        packUnit: 'PIECE',
        availabilityUnit: 'PIECE',
      });
    } else {
      this.form.patchValue({
        priceBasis: 'per_kg',
        unitLabel: 'kg',
        packUnit: 'KG',
        availabilityUnit: 'KG',
      });
    }
  }

  pickImage() {
    this.dialog
      .open(SelectMediaDialog, {
        data: { value: this.form.get('image')?.value || '' },
        disableClose: true,
        autoFocus: false,
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        panelClass: 'full-width-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.event === 'select' && result.data) {
          this.form.get('image')?.setValue(result.data);
        }
      });
  }

  save() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value: any = this.form.getRawValue();
    const body: Record<string, any> = {
      name: String(value.name || '').trim(),
      pricePerUnit: Number(value.pricePerUnit || 0),
      priceBasis: value.priceBasis,
      subscriptionEligible: !!value.subscriptionEligible,
      subscriptionCeilingPct: Number(value.subscriptionCeilingPct || 0),
      estimatedAvailability: Number(value.estimatedAvailability || 0),
      availabilityUnit: value.availabilityUnit,
      sortOrder: Number(value.sortOrder || 0),
    };
    if (value.image) {
      body['image'] = value.image;
    }

    if (!this.isEdit) {
      body['product'] = value.product;
      body['sku'] = String(value.sku || '').trim().toUpperCase();
      body['measurementMode'] = value.measurementMode;
      body['unitLabel'] = value.unitLabel;
      body['packSize'] = {
        value: Number(value.packValue || 0),
        unit: value.packUnit,
      };
    }

    this.isSaving = true;
    const request$ = this.isEdit
      ? this.admin.updateVariant(this.admin.idOf(this.data.variant), body)
      : this.admin.createVariant(body);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.util.onSuccess(this.isEdit ? 'jhatka_variant_updated' : 'jhatka_variant_created');
        this.dialogRef.close({ saved: true });
      },
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}

