import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Dialog for creating or editing a listing package.
 *
 * CREATE mode (`data` undefined): code, name, price, listingCount and
 * durationDays are required. EDIT mode: `code` and `price` are locked —
 * sold orders carry their own `packageSnapshot` (BR-15), so changing
 * what a vendor already bought is forbidden. Editable in place: name,
 * description, features, limits, sortOrder, status.
 */
@Component({
  selector: 'app-dialog-listing-package',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-listing-package.html',
})
export class DialogListingPackage {
  isEdit: boolean;
  isSaving: boolean = false;

  form: any = {
    code: '',
    name: '',
    description: '',
    price: null,
    listingCount: null,
    durationDays: 30,
    featuresText: '',
    maxImages: null,
    maxVideos: null,
    sortOrder: 0,
    status: true,
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogListingPackage>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.isEdit = !!data;
    if (this.isEdit) {
      this.form = {
        code: data.code,
        name: data.name || '',
        description: data.description || '',
        price: data.price,
        listingCount: data.listingCount,
        durationDays: data.durationDays,
        featuresText: Array.isArray(data.features) ? data.features.join('\n') : '',
        maxImages: data.limits?.maxImages ?? null,
        maxVideos: data.limits?.maxVideos ?? null,
        sortOrder: data.sortOrder || 0,
        status: data.status !== false,
      };
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  get canSubmit(): boolean {
    if (this.isSaving || !this.form.name) return false;
    if (!this.isEdit) {
      return !!this.form.code && this.form.price != null && this.form.durationDays > 0;
    }
    return true;
  }

  onSubmit() {
    if (!this.canSubmit) return;
    this.isSaving = true;
    const features = String(this.form.featuresText || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);
    let body: any;
    let url: string;
    let obs: any;
    if (this.isEdit) {
      body = {
        name: this.form.name,
        description: this.form.description || '',
        features,
        limits: {
          ...(this.form.maxImages != null ? { maxImages: this.form.maxImages } : {}),
          ...(this.form.maxVideos != null ? { maxVideos: this.form.maxVideos } : {}),
        },
        sortOrder: this.form.sortOrder || 0,
        status: this.form.status !== false,
      };
      url = `v1/realestate/admin/listing-packages/${this.form.code}`;
      obs = this.api.patch_private(url, body);
    } else {
      body = {
        code: String(this.form.code).trim().toUpperCase(),
        name: this.form.name,
        description: this.form.description || '',
        price: this.form.price,
        listingCount: this.form.listingCount || null,
        durationDays: this.form.durationDays,
        features,
        limits: {
          ...(this.form.maxImages != null ? { maxImages: this.form.maxImages } : {}),
          ...(this.form.maxVideos != null ? { maxVideos: this.form.maxVideos } : {}),
        },
        sortOrder: this.form.sortOrder || 0,
        status: this.form.status !== false,
      };
      url = 'v1/realestate/admin/listing-packages';
      obs = this.api.post_private(url, body);
    }
    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.dialogRef.close({ event: 'created' });
      },
      error: (error: any) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
