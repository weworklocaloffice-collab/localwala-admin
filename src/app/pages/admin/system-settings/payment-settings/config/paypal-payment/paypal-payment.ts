import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-paypal-payment',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './paypal-payment.html',
})
export class PaypalPayment {

  action: string = 'add';
  paymentForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    environment: new FormControl(false, [Validators.required]),
    isDefault: new FormControl(false, [Validators.required]),
    status: new FormControl(true, [Validators.required]),
    credentials: new FormGroup({
      id: new FormControl('', [Validators.required]),
      secret: new FormControl('', [Validators.required]),
    }),
    paymentWay: new FormControl('online'),
    translations: new FormArray([])
  });
  haveSubmitClicked: boolean = false;
  languages: any[] = [];
  translations: any[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    this.paymentForm.controls['slug'].patchValue('paypal');
    this.locale();
    this.getPaymentInfo();
  }

  getPaymentInfo() {
    console.log(this.paymentForm.getRawValue());
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/payment_config/get/' + this.paymentForm.value.slug).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.action = 'edit';
          this.paymentForm.controls['name'].setValue(response.name);
          this.paymentForm.controls['environment'].setValue(response.environment);
          this.paymentForm.controls['image'].setValue(response.image);
          this.paymentForm.controls['status'].setValue(response.status);
          this.paymentForm.controls['isDefault'].setValue(response.isDefault);
          if (response && response.credentials && response.credentials instanceof Object) {
            this.paymentForm.controls['credentials'].controls['id'].setValue(response && response.credentials && response.credentials.id ? response.credentials.id : '');
            this.paymentForm.controls['credentials'].controls['secret'].setValue(response && response.credentials && response.credentials.secret ? response.credentials.secret : '');
          }
          if (response && response.translations && response.translations instanceof Array) {

            this.translations = response.translations;
            this.locale();
          }
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
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
    console.log('on submit');
    console.log(this.paymentForm);
    console.log(this.paymentForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.paymentForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const locale = this.paymentForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/payment_config/save', this.paymentForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_payment_saved');
        if (response && response.id) {
          this.action = 'edit';
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update');
    const locale = this.paymentForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/payment_config/update/' + this.paymentForm.value.slug, this.paymentForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_payment_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('on reset');
    this.paymentForm.patchValue({
      name: '',
      slug: '',
      image: '',
      environment: false,
      status: true,
      isDefault: false,
      paymentWay: 'online',
      credentials: {
        id: '',
        secret: ''
      }
    });

    const translations = this.paymentForm.get('translations') as FormArray;
    translations.clear();
    this.paymentForm.controls['slug'].patchValue('paypal');
    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;
    this.haveSubmitClicked = false;
    console.log(this.paymentForm.getRawValue());
  }

  get f() {
    return this.paymentForm.controls;
  }

  get fCredentials() {
    return this.paymentForm.controls['credentials'].controls;
  }

  onImageClick() {
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.paymentForm.controls['image'].value },
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
        this.paymentForm.controls['image'].setValue(result.data);
      }
    });
  }

}
