import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { LsImageUploadComponent } from '../shared/ls-image-upload/ls-image-upload.component';

@Component({
  selector: 'app-dialog-ls-service',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, LsImageUploadComponent],
  templateUrl: './dialog-ls-service.html',
})
export class DialogLsService {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  isUploading: boolean = false;
  parentCategories: any[] = [];
  subcategories: any[] = [];

  form = new FormGroup({
    key: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    image: new FormControl(''),
    parentCategory: new FormControl('', [Validators.required]),
    category: new FormControl(''),
    bookingMode: new FormControl('REQUEST', [Validators.required]),
    pricingMode: new FormControl('FIXED', [Validators.required]),
    depositPercent: new FormControl(0, [Validators.min(0), Validators.max(100)]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsService>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.get_private('v1/local-services/admin/catalog/categories?limit=100').subscribe({
      next: (response: any) => {
        const categories = response && response.results ? response.results : [];
        this.parentCategories = categories
          .filter((category: any) => !category.parent)
          .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
        this.subcategories = categories
          .filter((category: any) => !!category.parent)
          .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  get childCategories(): any[] {
    const parent = this.form.get('parentCategory')?.value;
    return this.subcategories.filter((category: any) => (category.parent || '') === parent);
  }

  onParentCategoryChange() {
    this.form.patchValue({ category: '' });
  }


  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit || this.isUploading) return;
    const raw = this.form.getRawValue();
    const payload: any = {
      key: (raw.key || '').trim().toLowerCase(),
      name: (raw.name || '').trim(),
      description: raw.description || '',
      image: (raw.image || '').trim(),
      category: raw.category || raw.parentCategory,
      bookingMode: raw.bookingMode,
      pricingMode: raw.pricingMode,
      depositPercent: Number(raw.depositPercent) || 0,
    };
    this.isSubmit = true;
    this.api.post_private('v1/local-services/admin/catalog/services', payload).subscribe({
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
