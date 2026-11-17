import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { LsImageUploadComponent } from '../shared/ls-image-upload/ls-image-upload.component';

@Component({
  selector: 'app-dialog-ls-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, LsImageUploadComponent],
  templateUrl: './dialog-ls-category.html',
})
export class DialogLsCategory {
  isSubmit: boolean = false;
  isUploading: boolean = false;
  haveSubmitClicked: boolean = false;
  isEdit: boolean = false;
  editingId: string = '';
  categories: any[] = [];
  parentOptions: any[] = [];

  form = new FormGroup({
    key: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    parent: new FormControl(''),
    sortOrder: new FormControl(0, [Validators.min(0)]),
    description: new FormControl(''),
    image: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsCategory>,
    public util: UtilService,
    public api: ApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    const row = this.data && this.data.row ? this.data.row : null;
    if (row) {
      this.isEdit = true;
      this.editingId = row.id || row._id;
      this.form.patchValue({
        key: row.key || '',
        name: row.name || '',
        parent: row.parent || '',
        sortOrder: Number(row.sortOrder) || 0,
        description: row.description || '',
        image: row.image || '',
      });
      this.form.get('key')?.disable();
    }
    this.loadCategories();
  }

  loadCategories() {
    this.api.get_private('v1/local-services/admin/catalog/categories?limit=100').subscribe({
      next: (response: any) => {
        this.categories = response && response.results ? response.results : [];
        this.buildParentOptions();
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  buildParentOptions() {
    const blocked: string[] = [];
    if (this.editingId) {
      blocked.push(this.editingId);
      let changed = true;
      while (changed) {
        changed = false;
        for (const category of this.categories) {
          const id = category.id || category._id;
          const parent = category.parent || '';
          if (parent && blocked.indexOf(parent) !== -1 && blocked.indexOf(id) === -1) {
            blocked.push(id);
            changed = true;
          }
        }
      }
    }
    const byId: { [key: string]: any } = {};
    this.categories.forEach((category: any) => {
      byId[category.id || category._id] = category;
    });
    this.parentOptions = this.categories
      .filter((category: any) => blocked.indexOf(category.id || category._id) === -1)
      .map((category: any) => {
        const id = category.id || category._id;
        const parent = category.parent ? byId[category.parent] : null;
        return {
          id,
          child: !!category.parent,
          label: parent ? parent.name + ' / ' + category.name + ' (' + category.key + ')' : category.name + ' (' + category.key + ')',
        };
      })
      .sort((a: any, b: any) => Number(a.child) - Number(b.child) || a.label.localeCompare(b.label));
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit || this.isUploading) return;
    const raw = this.form.getRawValue();
    const payload: any = {
      name: (raw.name || '').trim(),
      parent: raw.parent || null,
      sortOrder: Number(raw.sortOrder) || 0,
      description: raw.description || '',
      image: (raw.image || '').trim(),
    };
    if (!this.isEdit) payload.key = (raw.key || '').trim().toLowerCase();
    this.isSubmit = true;
    const request = this.isEdit
      ? this.api.patch_private('v1/local-services/admin/catalog/categories/' + this.editingId, payload)
      : this.api.post_private('v1/local-services/admin/catalog/categories', payload);
    request.subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
