import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { JhatkaAdminService } from '../../jhatka-admin.service';
import { JhatkaCategory, JhatkaProduct } from '../../jhatka.models';

export interface ProductDialogData {
  product?: JhatkaProduct;
  categories: JhatkaCategory[];
}

@Component({
  selector: 'app-jhatka-product-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './product-dialog.html',
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
export class JhatkaProductDialog {
  isSaving = false;
  submitted = false;
  storageModes = ['chilled', 'frozen', 'ambient'];

  form = this.fb.group({
    name: [this.data.product?.name || '', [Validators.required, Validators.maxLength(140)]],
    category: [
      { value: this.categoryId, disabled: !!this.data.product },
      [Validators.required],
    ],
    code: [
      { value: this.data.product?.code || '', disabled: !!this.data.product },
      [Validators.required, Validators.maxLength(40)],
    ],
    hsnCode: [this.data.product?.hsnCode || '', [Validators.required]],
    taxRatePct: [
      this.data.product?.taxRatePct ?? 0,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    storageMode: [this.data.product?.storageMode || 'chilled'],
    shelfLifeDaysAmbient: [this.data.product?.shelfLifeDaysAmbient ?? null],
    prepTimeMinutes: [this.data.product?.prepTimeMinutes ?? null],
    description: [this.data.product?.description || ''],
    image: [this.data.product?.image || ''],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData,
    public dialogRef: MatDialogRef<JhatkaProductDialog>,
    public appApi: ApiService,
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    public util: UtilService,
    private dialog: MatDialog,
  ) {}

  get isEdit(): boolean {
    return !!this.data.product;
  }

  get categoryId(): string {
    return this.admin.idOf(this.data.product?.category);
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
      description: String(value.description || '').trim(),
      image: value.image || '',
      hsnCode: String(value.hsnCode || '').trim().toUpperCase(),
      taxRatePct: Number(value.taxRatePct || 0),
      storageMode: value.storageMode,
    };
    if (value.shelfLifeDaysAmbient !== null && value.shelfLifeDaysAmbient !== '') {
      body['shelfLifeDaysAmbient'] = Number(value.shelfLifeDaysAmbient);
    }
    if (value.prepTimeMinutes !== null && value.prepTimeMinutes !== '') {
      body['prepTimeMinutes'] = Number(value.prepTimeMinutes);
    }
    if (!this.isEdit) {
      body['category'] = value.category;
      body['code'] = String(value.code || '').trim().toUpperCase();
    }

    this.isSaving = true;
    const request$ = this.isEdit
      ? this.admin.updateProduct(this.admin.idOf(this.data.product), body)
      : this.admin.createProduct(body);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.util.onSuccess(this.isEdit ? 'jhatka_product_updated' : 'jhatka_product_created');
        this.dialogRef.close({ saved: true });
      },
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}

