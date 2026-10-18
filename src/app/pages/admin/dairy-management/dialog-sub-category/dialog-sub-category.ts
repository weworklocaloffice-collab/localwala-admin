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

@Component({
  selector: 'app-dialog-dairy-sub-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-sub-category.html',
})
export class DialogDairySubCategory {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;
  listOfCategories: any[] = [];

  subCategoryForm = new FormGroup({
    category: new FormControl('', [Validators.required]),
    key: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    sortOrder: new FormControl(0),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogDairySubCategory>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.getCategories();

    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.subCategoryForm.patchValue({
        // `category` comes back populated on a read, so it is an object here but a
        // bare id in the form. Reading `._id` handles the populated case without
        // assuming which one came back.
        category: values.category && values.category._id ? values.category._id : values.category,
        key: values.key || '',
        name: values.name,
        description: values.description || '',
        sortOrder: values.sortOrder || 0,
        status: values.status === true,
      });
    }
  }

  get f() {
    return this.subCategoryForm.controls;
  }

  getCategories() {
    this.api.get_private('v1/dairy/admin/catalog/categories?limit=100').subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.listOfCategories = response.results;
        }
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.subCategoryForm.invalid) {
      return;
    }

    const value: any = this.subCategoryForm.value;

    if (this.action == 'create') {
      this.api.post_private('v1/dairy/admin/catalog/sub_categories', value).subscribe({
        next: (response: any) => {
          this.dialogRef.close({ event: 'add', data: response });
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }

    const body: any = {
      category: value.category,
      name: value.name,
      description: value.description,
      sortOrder: value.sortOrder,
      status: value.status,
    };

    this.api.patch_private('v1/dairy/admin/catalog/sub_categories/' + this.id, body).subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }
}
