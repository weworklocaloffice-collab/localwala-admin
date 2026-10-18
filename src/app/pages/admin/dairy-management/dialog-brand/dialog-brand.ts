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
  selector: 'app-dialog-dairy-brand',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-brand.html',
})
export class DialogDairyBrand {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;

  /**
   * Brands have no `key` — a brand is identified by its name, unlike a category
   * which needs a stable machine key for imports and product rows.
   */
  brandForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    country: new FormControl(''),
    fssaiLicence: new FormControl(''),
    description: new FormControl(''),
    sortOrder: new FormControl(0),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogDairyBrand>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.brandForm.patchValue({
        name: values.name,
        country: values.country || '',
        fssaiLicence: values.fssaiLicence || '',
        description: values.description || '',
        sortOrder: values.sortOrder || 0,
        status: values.status === true,
      });
    }
  }

  get f() {
    return this.brandForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.brandForm.invalid) {
      return;
    }

    const value: any = this.brandForm.value;

    if (this.action == 'create') {
      this.api.post_private('v1/dairy/admin/catalog/brands', value).subscribe({
        next: (response: any) => {
          this.dialogRef.close({ event: 'add', data: response });
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }

    this.api.patch_private('v1/dairy/admin/catalog/brands/' + this.id, value).subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }
}
