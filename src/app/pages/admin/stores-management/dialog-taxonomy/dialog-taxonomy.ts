import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Create/edit dialog for categories and subcategories.
 *
 * ## One dialog, two entity types
 *
 * The two forms differ by two fields — a subcategory needs a parent category, a category
 * does not — and share name, icon and sort order. Splitting them would duplicate the
 * submit/validate/toast block for a two-field difference. `kind` selects which shape is
 * shown and which endpoint is called.
 *
 * This is separate from the admin `stores.controller.js` dialog pattern because the
 * fields genuinely differ; there is no shared base to extract without a null check on
 * every field.
 */
export class TaxonomyDialogBase {
  action: string;
  editing: any;
  kind: string; // 'category' | 'subcategory'
  saving: boolean = false;

  form: any = {};

  constructor(
    public data: any,
    public dialogRef: MatDialogRef<any>,
    public api: ApiService,
    public util: UtilService,
  ) {
    this.action = data.action;
    this.editing = data.values || null;
    this.kind = data.kind;

    if (this.editing) {
      this.form = { ...this.editing };
    } else {
      this.form = { status: true, sortOrder: 0 };
    }
  }

  get isEdit(): boolean {
    return this.action === 'edit';
  }

  get endpoint(): string {
    return 'v1/admin/stores/catalog/' + (this.kind === 'category' ? 'categories' : 'subcategories');
  }

  save() {
    if (!this.form.name || !this.form.name.trim()) {
      this.util.onError('ts_name_required', '');
      return;
    }
    // A subcategory without a parent is not creatable — the category is what makes it
    // reachable from any browse path.
    if (this.kind === 'subcategory' && !this.form.category) {
      this.util.onError('stores_parent_required', '');
      return;
    }

    this.saving = true;

    const body: any = {
      name: this.form.name.trim(),
      sortOrder: this.form.sortOrder,
      status: this.form.status,
    };
    if (this.form.icon) body.icon = this.form.icon;
    if (this.kind === 'subcategory') body.category = this.form.category;
    if (this.form.categoryDefaults) body.categoryDefaults = this.form.categoryDefaults;

    const request = this.isEdit
      ? this.api.patch_private(this.endpoint + '/' + this.editing._id, body)
      : this.api.post_private(this.endpoint, body);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close({ event: this.isEdit ? 'update' : 'add' });
      },
      error: (error: any) => {
        this.saving = false;
        // A duplicate slug/name is the common rejection here, and the API message names
        // it — far more useful than a generic failure toast.
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

  cancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog-stores-category',
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title class="m-b-0">
      {{
        isEdit
          ? util.appTranslate('ts_edit_category')
          : util.appTranslate('ts_add_new_category')
      }}
    </h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('th_name') }}</mat-label>
        <input matInput [(ngModel)]="form.name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('stores_icon') }}</mat-label>
        <!--
          A free-text icon name, not an icon picker. The value is a Tabler ligature sent
          to the Flutter app, and a picker over 4000 icons that the app may not bundle is
          a worse control than the name field it replaces.
        -->
        <input matInput [(ngModel)]="form.icon" placeholder="tablerShoppingCart" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('sort_order') }}</mat-label>
        <input type="number" matInput [(ngModel)]="form.sortOrder" />
      </mat-form-field>

      <mat-slide-toggle [(ngModel)]="form.status">
        {{ util.appTranslate('th_status') }}
      </mat-slide-toggle>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-8">
      <button mat-stroked-button (click)="cancel()" [disabled]="saving">
        {{ util.appTranslate('ts_cancel') }}
      </button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="saving">
        {{ util.appTranslate('ts_save') }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogStoresCategory extends TaxonomyDialogBase {
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    dialogRef: MatDialogRef<DialogStoresCategory>,
    api: ApiService,
    util: UtilService,
  ) {
    super(data, dialogRef, api, util);
    this.kind = 'category';
  }
}

@Component({
  selector: 'app-dialog-stores-subcategory',
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title class="m-b-0">
      {{
        isEdit
          ? util.appTranslate('ts_edit_subcategory')
          : util.appTranslate('ts_add_new_subcategory')
      }}
    </h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('th_name') }}</mat-label>
        <input matInput [(ngModel)]="form.name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('stores_parent_category') }}</mat-label>
        <mat-select [(ngModel)]="form.category">
          @for (c of categories; track c._id) {
            <mat-option [value]="c._id">{{ c.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ util.appTranslate('sort_order') }}</mat-label>
        <input type="number" matInput [(ngModel)]="form.sortOrder" />
      </mat-form-field>

      <mat-slide-toggle [(ngModel)]="form.status">
        {{ util.appTranslate('th_status') }}
      </mat-slide-toggle>

      <div class="f-s-12 text-muted mt-12">
        {{ util.appTranslate('stores_subcategory_defaults_note') }}
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-8">
      <button mat-stroked-button (click)="cancel()" [disabled]="saving">
        {{ util.appTranslate('ts_cancel') }}
      </button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="saving">
        {{ util.appTranslate('ts_save') }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogStoresSubcategory extends TaxonomyDialogBase {
  categories: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    dialogRef: MatDialogRef<DialogStoresSubcategory>,
    api: ApiService,
    util: UtilService,
  ) {
    super(data, dialogRef, api, util);
    this.kind = 'subcategory';
    this.loadCategories();
  }

  loadCategories() {
    this.api.get_private('v1/admin/stores/catalog/categories?limit=200').subscribe({
      next: (response: any) => {
        this.categories = response && response.results ? response.results : [];
        // On edit, the parent arrives as a populated object, but the select wants the id.
        if (this.isEdit && this.editing.category && typeof this.editing.category !== 'string') {
          this.form.category = this.editing.category._id;
        }
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }
}