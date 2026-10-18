import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

const GROUP_OPTIONS = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL'];

/**
 * Dialog for creating or editing a real estate category.
 *
 * When `data` is passed, the dialog opens in EDIT mode and pre-fills
 * from the row. When `data` is undefined, the dialog opens in CREATE
 * mode. On save the dialog calls the same admin endpoint (`POST` or
 * `PATCH` depending on mode) and closes with `{event:'created'}`.
 */
@Component({
  selector: 'app-dialog-category',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-category.html',
})
export class DialogCategory {
  groups = GROUP_OPTIONS;
  isEdit: boolean;
  isSaving: boolean = false;

  // Form fields. The advanced `specSchema` editor is out of scope
  // for this dialog — fields are managed separately by the admin
  // through a dedicated field editor (or directly in the seed).
  form: any = {
    key: '',
    name: '',
    group: 'APARTMENT',
    description: '',
    icon: '',
    transactionTypes: ['BUY', 'RENT'],
    amenityOptions: [],
    sortOrder: 0,
    status: true,
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogCategory>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.isEdit = !!data;
    if (this.isEdit) {
      this.form = {
        key: data.key,
        name: data.name,
        group: data.group,
        description: data.description || '',
        icon: data.icon || '',
        transactionTypes: data.transactionTypes || ['BUY', 'RENT'],
        amenityOptions: data.amenityOptions || [],
        sortOrder: data.sortOrder || 0,
        status: data.status !== false,
      };
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.form.key || !this.form.name || !this.form.group) return;
    this.isSaving = true;
    const body = {
      ...this.form,
      amenityOptions: this.form.amenityOptions,
    };
    const url = this.isEdit
      ? `v1/realestate/admin/categories/${this.data._id}`
      : 'v1/realestate/admin/categories';
    const obs = this.isEdit
      ? this.api.patch_private(url, body)
      : this.api.post_private(url, body);
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
