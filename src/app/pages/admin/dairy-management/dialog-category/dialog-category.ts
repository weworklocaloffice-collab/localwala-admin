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
  selector: 'app-dialog-dairy-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-category.html',
})
export class DialogDairyCategory {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;

  /**
   * `key` is required on create and immutable on update.
   *
   * It is the machine-facing identifier every product and import references, so
   * changing it after the fact would orphan those records. The API enforces this by
   * making it required in the create body; the field is simply absent from an update
   * so a plain rename cannot rewrite it.
   */
  categoryForm = new FormGroup({
    key: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    image: new FormControl(''),
    featured: new FormControl(false),
    sortOrder: new FormControl(0),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogDairyCategory>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.categoryForm.patchValue({
        key: values.key,
        name: values.name,
        description: values.description || '',
        image: values.image || '',
        featured: values.featured === true,
        sortOrder: values.sortOrder || 0,
        status: values.status === true,
      });
    }
  }

  get f() {
    return this.categoryForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.categoryForm.invalid) {
      return;
    }

    const value: any = this.categoryForm.value;

    if (this.action == 'create') {
      this.api.post_private('v1/dairy/admin/catalog/categories', value).subscribe({
        next: (response: any) => {
          this.dialogRef.close({ event: 'add', data: response });
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }

    // `key` is deliberately not sent on update.
    const body: any = {
      name: value.name,
      description: value.description,
      image: value.image,
      featured: value.featured,
      sortOrder: value.sortOrder,
      status: value.status,
    };

    this.api.patch_private('v1/dairy/admin/catalog/categories/' + this.id, body).subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }
}
