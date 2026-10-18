import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';

@Component({
  selector: 'app-dialog-city',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule],
  templateUrl: './dialog-city.html',
})
export class DialogCity {
  action: string = 'create';
  cityForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    latitude: new FormControl('', [Validators.required]),
    longitude: new FormControl('', [Validators.required]),
    type: new FormControl('Point', [Validators.required]),
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
    public dialogRef: MatDialogRef<DialogCity>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.cityForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.cityForm.controls['image'].setValue(values && values.image ? values.image : '');
      if (values && values.location && values.location.coordinates && values.location.coordinates.length) {
        this.cityForm.controls['latitude'].setValue(values && values.location && values.location.coordinates && values.location.coordinates.length ? values.location.coordinates[1] : '');
        this.cityForm.controls['longitude'].setValue(values && values.location && values.location.coordinates && values.location.coordinates.length ? values.location.coordinates[0] : '');
      }

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
    console.log('submit', this.action, this.languages);
    const locale = this.cityForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.cityForm);
    this.isFormSubmit = true;
    if (this.cityForm.valid) {
      if (this.action == 'create') {
        this.saveCity();
      } else {
        this.updateCity();
      }
    }
  }

  saveCity() {
    this.isSubmit = true;
    this.api.post_private('v1/admin/cities/save', this.cityForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_city_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateCity() {
    this.isSubmit = true;
    this.api.patch_private('v1/admin/cities/update/' + this.id, this.cityForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_city_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        console.log(error);
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.cityForm.controls;
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.cityForm.controls['image'].value },
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
        this.cityForm.controls['image'].setValue(result.data);
      }
    });
  }
}
