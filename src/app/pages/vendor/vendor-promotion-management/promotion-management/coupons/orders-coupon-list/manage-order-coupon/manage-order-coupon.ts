import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-manage-order-coupon',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './manage-order-coupon.html',
})
export class ManageOrderCoupon {

  action: string = 'add';
  id: string = '';
  couponForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    limitSameUser: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    expires: new FormControl('', [Validators.required]),
    discountType: new FormControl('amount', [Validators.required]),
    minDiscount: new FormControl('', [Validators.required]),
    maxDiscount: new FormControl({ value: '', disabled: true }),
    minCartTotal: new FormControl('', [Validators.required]),
    restaurantId: new FormControl('', [Validators.required]),
    createdById: new FormControl('', [Validators.required]),
    translations: new FormArray([])
  });
  languages: any[] = [];
  translations: any[] = [];
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private navCtrl: Location
  ) {
    this.action = this.route.snapshot.paramMap.get('id') ? 'edit' : 'add';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    const userId = this.util.getItem('_uid');
    console.log(`User Id --> ${userId}`);
    if (userId && userId !== null && userId !== '') {
      this.couponForm.controls['createdById'].setValue(userId);
    }
    const vendorId = this.util.getItem('_vendorId');
    if (vendorId && vendorId !== null && vendorId !== '') {
      this.couponForm.controls['restaurantId'].setValue(vendorId);
    }
    console.log(this.couponForm.getRawValue())
    console.log(`--> ${this.action} id --> ${this.id}`);
    if (this.id && this.action == 'edit') {
      console.log('on edit');
      this.getInfo();
    } else {
      this.locale();
    }
  }

  getInfo() {
    console.log('Get Info');
    const spinnerRef = this.util.start('ts_fetching');
    const param = {
      id: this.id,
      userId: this.couponForm.controls.createdById.value!.toString()
    };
    this.api.post_private('v1/vendor_web/coupons/getInfo/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.info && response.info.id && response.info.id == this.id) {
          const info = response.info;
          this.couponForm.controls['code'].patchValue(info.code);
          this.couponForm.controls['discountType'].patchValue(info.discountType);
          this.couponForm.controls['limitSameUser'].patchValue(info.limitSameUser);
          this.couponForm.controls['maxDiscount'].patchValue(info.maxDiscount);
          this.couponForm.controls['minCartTotal'].patchValue(info.minCartTotal);
          this.couponForm.controls['minDiscount'].patchValue(info.minDiscount);
          this.couponForm.controls['name'].patchValue(info.name);

          if (info && info.discountType == 'percentage') {
            this.couponForm.controls['maxDiscount'].enable();
            this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
          } else {
            this.couponForm.controls['maxDiscount'].disable();
            this.couponForm.controls['maxDiscount'].clearValidators();
          }

          const startDate = DateTime.fromISO(info.start).toFormat('yyyy-MM-dd');
          const endDate = DateTime.fromISO(info.expires).toFormat('yyyy-MM-dd');
          console.log(startDate, endDate);
          this.couponForm.controls['start'].setValue(startDate);
          this.couponForm.controls['expires'].setValue(endDate);

          if (info && info.translations && info.translations instanceof Array) {
            this.translations = info.translations;
            this.locale();
          }
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
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

  get f() {
    return this.couponForm.controls;
  }

  onDiscountTypeChange(event: MatSelectChange) {
    console.log(event);
    if (event && event.value == 'percentage') {
      this.couponForm.controls['maxDiscount'].enable();
      this.couponForm.controls['maxDiscount'].setValidators([Validators.required]);
    } else {
      this.couponForm.controls['maxDiscount'].disable();
      this.couponForm.controls['maxDiscount'].clearValidators();
    }
  }

  onReset() {
    console.log('on reset');

    this.couponForm.patchValue({
      name: '',
      code: '',
      limitSameUser: '',
      start: '',
      expires: '',
      discountType: 'amount',
      minDiscount: '',
      maxDiscount: '',
      minCartTotal: '',
      restaurantId: '',
      createdById: '',
    });

    this.couponForm.get('maxDiscount')?.disable();

    (this.couponForm.get('translations') as FormArray).clear();

    const localeMapped = this.languages.map((item) => {
      item.value = '';
      return item;
    });
    this.languages = localeMapped;

    this.haveSubmitClicked = false;
    this.isSubmit = false;
    console.log(this.couponForm.getRawValue());
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action, this.languages);
    const locale = this.couponForm.get('translations') as FormArray;
    locale.clear();
    this.languages.forEach((element) => {
      locale.push(this.fb.group({ name: [element.name], code: [element.code], nativeName: [element.nativeName], value: [element.value] }));
    });
    console.log(this.couponForm);
    if (this.couponForm.valid) {
      if (this.action == 'add') {
        this.saveCoupon();
      } else {
        this.updateCoupon();
      }
    }
  }

  saveCoupon() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    const sendData = this.couponForm.getRawValue();
    this.api.post_private('v1/vendor_web/coupons/request_new', sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_request_sent');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  updateCoupon() {
    console.log('on update');
    const spinnerRef = this.util.start('ts_updating');
    const sendData = this.couponForm.getRawValue();
    this.api.patch_private('v1/vendor_web/coupons/update/' + this.id, sendData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_coupon_updated');
        this.navCtrl.back();
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

}
