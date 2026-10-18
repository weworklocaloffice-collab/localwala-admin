import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SelectVendorMediaDialog } from 'src/app/pages/vendor/vendor-media-management/select-vendor-media-dialog/select-vendor-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-dining-menu',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-dining-menu.html',
})
export class DialogDiningMenu {

  action: string = 'create';
  menuForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    photos: new FormArray([]),
    translations: new FormArray([]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogDiningMenu>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      console.log(values);
      this.menuForm.controls['name'].setValue(values.name);
      if (values && values.translations && values.translations instanceof Array) {
        this.translations = values.translations;
      }
      if (values && values.photos && values.photos instanceof Array) {
        const photosArray = this.menuForm.get('photos') as FormArray;
        values.photos.forEach((element: string) => {
          console.log(element);
          photosArray.push(new FormControl(element, Validators.required));
        });
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
    const locale = this.menuForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    if (this.menuForm.valid) {
      const photosArray = this.menuForm.get('photos') as FormArray;
      if (photosArray.length <= 0) {
        photosArray.push(new FormControl('', Validators.required)); //
      }
      this.dialogRef.close({ event: 'success', data: this.menuForm.getRawValue() });
    }
  }

  get f() {
    return this.menuForm.controls;
  }

  onAddPhoto() {
    const dialogRef = this.dialog.open(SelectVendorMediaDialog, {
      data: { value: '' },
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
        const photosArray = this.menuForm.get('photos') as FormArray;
        photosArray.push(new FormControl(result.data, Validators.required)); //
      }
    });
  }

  deletePhoto(index: number) {
    console.log(index);
    const photosArray = this.menuForm.get('photos') as FormArray;
    photosArray.removeAt(index);
  }

}
