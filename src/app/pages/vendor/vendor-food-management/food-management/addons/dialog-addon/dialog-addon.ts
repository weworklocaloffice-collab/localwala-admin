import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-addon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-addon.html',
})
export class DialogAddon {

  action: string = 'create';
  addonForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    restaurant: new FormControl(''),
    stockType: new FormControl('unlimited', [Validators.required]),
    stockNumber: new FormControl('-1', [Validators.required]),
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
    public dialogRef: MatDialogRef<DialogAddon>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    this.addonForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.addonForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.addonForm.controls['price'].setValue(values && values.price ? values.price : '');
      this.addonForm.controls['stockType'].setValue(values.stockType);
      if (values.stockType == 'unlimited') {
        this.addonForm.controls['stockNumber'].setValue('-1');
        this.addonForm.controls['stockNumber'].disable();
      } else {
        this.addonForm.controls['stockNumber'].setValue(values.stockNumber);
        this.addonForm.controls['stockNumber'].enable();
      }
      if (values && values.translations && values.translations instanceof Array) {

        this.translations = values.translations;
      }
    } else {
      this.addonForm.controls['stockNumber'].clearValidators();
      this.addonForm.controls['stockNumber'].disable();
      this.addonForm.controls['stockNumber'].patchValue('-1');
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
    const locale = this.addonForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.addonForm.getRawValue());
    if (this.addonForm.valid) {
      if (this.action == 'create') {
        this.saveAddon();
      } else {
        this.updateAddon();
      }
    }
  }

  saveAddon() {
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/addons/save', this.addonForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_addon_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  updateAddon() {
    this.isSubmit = true;
    this.api.patch_private('v1/vendor_web/addons/update/' + this.id, this.addonForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_addon_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  get f() {
    return this.addonForm.controls;
  }

  onStockChangeEvent(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'unlimited') {
      this.addonForm.controls['stockNumber'].setValue('-1');
      this.addonForm.controls['stockNumber'].clearValidators();
      this.addonForm.controls['stockNumber'].disable();
    } else {
      this.addonForm.controls['stockNumber'].setValue('');
      this.addonForm.controls['stockNumber'].setValidators(Validators.required);
      this.addonForm.controls['stockNumber'].enable();
    }
  }

}
