import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-custom-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-custom-category.html',
})
export class DialogCustomCategory {

  action: string = 'create';
  categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    restaurant: new FormControl(''),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogCustomCategory>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.categoryForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.categoryForm.controls['image'].setValue(values && values.image ? values.image : '');
      if (values && values.translations && values.translations instanceof Array) {

        this.translations = values.translations;
      }
    }
    this.locale();
  }

  locale() {
    if (Array.isArray(this.util.locales) && this.util.locales.length > 0) {
      this.languages = [];
      this.util.locales.forEach((element) => {
        const locale = {
          code: element.code,
          name: element.name,
          nativeName: element.nativeName,
          value: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.value = translate.value;
          }
        });
      });
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    const locale = this.categoryForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.categoryForm);
    if (this.categoryForm.valid) {
      if (this.action == 'create') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/vendor_category/save', this.categoryForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_category_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onUpdate() {
    this.isSubmit = true;
    this.api.patch_private('v1/vendor_web/vendor_category/update/' + this.id, this.categoryForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_category_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  get f() {
    return this.categoryForm.controls;
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectVendorMediaDialog, {
      data: { value: this.categoryForm.controls['image'].value },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.categoryForm.controls['image'].setValue(result.data);
      }
    });
  }

}
