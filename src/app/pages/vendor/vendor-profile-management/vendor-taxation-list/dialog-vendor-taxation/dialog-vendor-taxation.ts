import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-vendor-taxation',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule],
  templateUrl: './dialog-vendor-taxation.html',
})
export class DialogVendorTaxation {

  action: string = 'create';
  taxationForm = new FormGroup({
    restaurant: new FormControl('', [Validators.required]),
    taxName: new FormControl('', [Validators.required]),
    taxAmount: new FormControl('', [Validators.required]),
    translation: new FormArray([])
  });
  isSubmit: boolean = false;
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  id: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogVendorTaxation>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    this.taxationForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      console.log(values);
      this.id = values.id;
      this.taxationForm.controls['taxName'].setValue(values && values.taxName ? values.taxName : '');
      this.taxationForm.controls['taxAmount'].setValue(values && values.taxAmount ? values.taxAmount : '0');
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
          title: ''
        };
        this.languages.push(locale);
      });
      this.languages.forEach((locale) => {
        this.translations.forEach((translate) => {
          if (locale.code == translate.code) {
            locale.title = translate.title;
          }
        });
      });
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    const locale = this.taxationForm.get('translation') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], title: [element.title] }));
    });
    console.log(this.taxationForm);
    if (this.taxationForm.valid) {
      if (this.action == 'create') {
        this.saveTaxation();
      } else {
        this.updateTaxation();
      }
    }
  }

  saveTaxation() {
    console.log('on Save--> ');
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/food_taxation/save/', this.taxationForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_taxation_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  updateTaxation() {
    console.log('on Update-->');
    console.log(this.id);
    this.isSubmit = true;
    this.api.patch_private('v1/vendor_web/food_taxation/update/' + this.id + '/' + this.util.getItem('_vendorId'), this.taxationForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_taxation_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  get f() {
    return this.taxationForm.controls;
  }

}
