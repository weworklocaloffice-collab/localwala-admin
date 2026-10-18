import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-restaurant-types',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-restaurant-types.html',
})
export class DialogRestaurantTypes {

  action: string = 'create';
  restaurantTypeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  id: string = '';
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogRestaurantTypes>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.restaurantTypeForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.restaurantTypeForm.controls['image'].setValue(values && values.image ? values.image : '');
      console.log(this.restaurantTypeForm.value);
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

  get f() {
    return this.restaurantTypeForm.controls;
  }

  onSubmit() {
    console.log('submit', this.action, this.languages, this.restaurantTypeForm);
    const locale = this.restaurantTypeForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    this.isFormSubmit = true;
    if (this.restaurantTypeForm.valid) {
      if (this.action == 'create') {
        this.isSubmit = true;
        this.api.post_private('v1/admin/restaurantType/save', this.restaurantTypeForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false
            this.util.onSuccess('ts_restaurant_type_added');
            this.dialogRef.close({ event: 'add', data: response });
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      } else {
        this.isSubmit = true;
        this.api.patch_private('v1/admin/restaurantType/update/' + this.id, this.restaurantTypeForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false
            this.util.onSuccess('ts_restaurant_type_updated');
            this.dialogRef.close({ event: 'update', data: response });
          }, error: (error: any) => {
            this.isSubmit = false;
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.restaurantTypeForm.controls['image'].value },
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
        this.restaurantTypeForm.controls['image'].setValue(result.data);
      }
    });
  }

}
