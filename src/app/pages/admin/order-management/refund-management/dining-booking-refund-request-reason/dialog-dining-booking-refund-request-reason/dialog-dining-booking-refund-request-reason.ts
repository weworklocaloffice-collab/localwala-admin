import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-dining-booking-refund-request-reason',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-dining-booking-refund-request-reason.html',
})
export class DialogDiningBookingRefundRequestReason {

  action: string = 'create';
  reasonForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
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
    public dialogRef: MatDialogRef<DialogDiningBookingRefundRequestReason>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.reasonForm.controls['name'].setValue(values && values.name ? values.name : '');
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
    const locale = this.reasonForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.reasonForm);
    if (this.reasonForm.valid) {
      if (this.action == 'create') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    this.isSubmit = true;
    this.api.post_private('v1/admin/dining_booking_refund_request_reason/save', this.reasonForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_reason_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    this.isSubmit = true;
    this.api.patch_private('v1/admin/dining_booking_refund_request_reason/update/' + this.id, this.reasonForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_reason_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.reasonForm.controls;
  }

}
