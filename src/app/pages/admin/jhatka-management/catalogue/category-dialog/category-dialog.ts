import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { UtilService } from 'src/app/services/util-service';
import { JhatkaAdminService } from '../../jhatka-admin.service';
import { JhatkaCategory } from '../../jhatka.models';

export interface CategoryDialogData {
  category?: JhatkaCategory;
  categories: JhatkaCategory[];
  launchRoots: string[];
}

@Component({
  selector: 'app-jhatka-category-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './category-dialog.html',
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
      .root-hint {
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
        font-size: 12px;
        margin-bottom: 8px;
      }
      .root-chip {
        display: inline-block;
        margin: 2px 4px 2px 0;
        padding: 2px 7px;
        border-radius: 6px;
        background: var(--mat-sys-surface-container-lowest);
        border: 1px solid var(--mat-sys-outline-variant);
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }
      .readonly-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
        padding: 9px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .readonly-row:last-child {
        border-bottom: 0;
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
export class JhatkaCategoryDialog {
  isSaving = false;
  submitted = false;

  form = this.fb.group({
    key: [
      { value: '', disabled: !!this.data.category },
      [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)],
    ],
    name: [this.data.category?.name || '', [Validators.required, Validators.maxLength(120)]],
    parent: [{ value: this.parentId, disabled: !!this.data.category }],
    description: [this.data.category?.description || ''],
    defaultMeasurementMode: [this.data.category?.defaultMeasurementMode || ''],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogData,
    public dialogRef: MatDialogRef<JhatkaCategoryDialog>,
    private fb: FormBuilder,
    public admin: JhatkaAdminService,
    public util: UtilService,
  ) {}

  get isEdit(): boolean {
    return !!this.data.category;
  }

  get parentId(): string {
    return this.admin.idOf(this.data.category?.parent);
  }

  get parentName(): string {
    const parent = this.data.category?.parent;
    if (!parent) {
      return 'Root category';
    }
    if (typeof parent === 'string') {
      return (
        this.data.categories.find((category) => this.admin.idOf(category) === parent)?.name ||
        'Parent category'
      );
    }
    return parent.name;
  }

  get rootKeyInvalid(): boolean {
    if (this.isEdit) {
      return false;
    }
    const value = this.form.getRawValue();
    if (value.parent) {
      return false;
    }
    return !!value.key && !this.data.launchRoots.includes(String(value.key).toLowerCase());
  }

  save() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.rootKeyInvalid) {
      return;
    }

    const value: any = this.form.getRawValue();
    const body: Record<string, any> = {
      name: String(value.name || '').trim(),
      description: String(value.description || '').trim(),
    };
    if (value.defaultMeasurementMode) {
      body['defaultMeasurementMode'] = value.defaultMeasurementMode;
    }
    if (!this.isEdit) {
      body['key'] = String(value.key || '').trim().toLowerCase();
      if (value.parent) {
        body['parent'] = value.parent;
      }
    }

    this.isSaving = true;
    const request$ = this.isEdit
      ? this.admin.updateCategory(this.admin.idOf(this.data.category), body)
      : this.admin.createCategory(body);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.util.onSuccess(this.isEdit ? 'jhatka_category_updated' : 'jhatka_category_created');
        this.dialogRef.close({ saved: true });
      },
      error: (error) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}

