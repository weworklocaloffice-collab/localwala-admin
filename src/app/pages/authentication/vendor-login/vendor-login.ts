import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { Router, RouterModule } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CountryCodeInterface } from 'src/app/interfaces/country.code.interface';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-vendor-login',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './vendor-login.html',
})
export class VendorLogin {

  restaurantLoginWith: string = 'email_password';
  emailPasswordForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
    userAgent: new FormControl('browser'),
    locale: new FormControl('en'),
  });
  showPassword: boolean = true;
  phonePasswordForm = new FormGroup({
    countryCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
    userAgent: new FormControl('browser'),
    locale: new FormControl('en'),
  });
  emailOtpForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    remember: new FormControl(false),
    userAgent: new FormControl('browser'),
    locale: new FormControl('en'),
    verificationId: new FormControl('none', [Validators.required]),
    verificationCode: new FormControl('none', [Validators.required]),
  });
  phoneOtpForm = new FormGroup({
    countryCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
    locale: new FormControl('en'),
    userAgent: new FormControl('browser'),
    id: new FormControl('none', [Validators.required]),
    verificationCode: new FormControl('none', [Validators.required]),
  });
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();
  isSubmit: boolean = false;
  otpSent: boolean = false;
  otpLength: number = 0;
  canResendOtp: boolean = false;
  provider: string = '';

  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService) {
    this.restaurantLoginWith = this.util.getItem('_restaurantLoginWith');
    console.log(this.restaurantLoginWith);

    this.phonePasswordForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.phoneOtpForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.getCountryCodes();
    const defaultLocale = this.util.getItem('_appLocale');
    if (defaultLocale && defaultLocale != null && defaultLocale != '') {
      this.emailPasswordForm.controls['locale'].setValue(defaultLocale);
      this.phonePasswordForm.controls['locale'].setValue(defaultLocale);
      this.phoneOtpForm.controls['locale'].setValue(defaultLocale);
      this.emailOtpForm.controls['locale'].setValue(defaultLocale);
    } else {
      this.emailPasswordForm.controls['locale'].setValue('en');
      this.phonePasswordForm.controls['locale'].setValue('en');
      this.phoneOtpForm.controls['locale'].setValue('en');
      this.emailOtpForm.controls['locale'].setValue('en');
    }
  }

  getCountryCodes() {
    this.api.getLocalAssets('countryCodes.json').then((response: any) => {
      if (response) {
        this.listOfCountryCodes = response;
        this.countryCodes = this.countryCodeCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this._filterCountryCode(element) : this.listOfCountryCodes.slice()))
        );

        const defaultCountryCode = this.listOfCountryCodes.filter(x => x.dial_code == this.api.defaultCountryCode);
        console.log(defaultCountryCode);
        this.countryCodeCtrl.setValue(defaultCountryCode[0].flag + ' ' + defaultCountryCode[0].dial_code + ' ' + defaultCountryCode[0].name);
      }
    }).catch((error: any) => {
      console.log(error);
      this.util.onError('ts_something_went_wrong', '');
    });
  }

  private _filterCountryCode(value: string): CountryCodeInterface[] {
    const filterValue = value.toLowerCase();
    return this.listOfCountryCodes.filter((element) =>
      element.name.toLowerCase().includes(filterValue)
    );
  }

  get epf() {
    return this.emailPasswordForm.controls;
  }

  get ppf() {
    return this.phonePasswordForm.controls;
  }

  get eoF() {
    return this.emailOtpForm.controls;
  }

  get poF() {
    return this.phoneOtpForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.phonePasswordForm.controls['countryCode'].setValue(splitString[1]);
        this.phoneOtpForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  emailPasswordLogin() {
    console.log(this.emailPasswordForm);
    if (this.emailPasswordForm.valid) {
      console.log('on login', this.emailPasswordForm.value);
      try {
        this.isSubmit = true;
        this.api.post_public('v1/auth/vendor_web/login', this.emailPasswordForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.user && response.user.id) {
              this.util.setItem('_uid', response.user.id);
              this.util.setItem('_authRole', response.user.role);
              this.util.setItem('_authEmail', response.user.email);
              this.util.setItem('_authFirstName', response.user.firstName);
              this.util.setItem('_authLastName', response.user.lastName);
              this.util.setItem('_authCoverImage', response.user.image);
              if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendor') {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.vendor.pos);
                this.util.setItem('_vendorOwnDriver', response.vendor.ownDriver);
                this.util.setItem('_vendorPromote', response.vendor.promote);
                this.util.setItem('_vendorCustomCategory', response.vendor.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.vendor.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.vendor.preBooking);
                this.util.setItem('_vendorTableOrder', response.vendor.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.vendor.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.vendor.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.vendor.ownKitchen);
              } else if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendorOutlet' && response.manager && response.manager.id) {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.manager.pos);
                this.util.setItem('_vendorOwnDriver', response.manager.ownDriver);
                this.util.setItem('_vendorPromote', response.manager.promote);
                this.util.setItem('_vendorCustomCategory', response.manager.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.manager.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.manager.preBooking);
                this.util.setItem('_vendorTableOrder', response.manager.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.manager.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.manager.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.manager.ownKitchen);
              }
              this.router.navigate(['/vendor']);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  phonePasswordLogin() {
    console.log(this.phonePasswordForm);
    if (this.phonePasswordForm.valid) {
      console.log('on login', this.phonePasswordForm.value);
      try {
        this.isSubmit = true;
        this.api.post_public('v1/auth/vendor/login_cmp_web', this.phonePasswordForm.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.user && response.user.id) {
              this.util.setItem('_uid', response.user.id);
              this.util.setItem('_authRole', response.user.role);
              this.util.setItem('_authEmail', response.user.email);
              this.util.setItem('_authFirstName', response.user.firstName);
              this.util.setItem('_authLastName', response.user.lastName);
              this.util.setItem('_authCoverImage', response.user.image);
              if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendor') {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.vendor.pos);
                this.util.setItem('_vendorOwnDriver', response.vendor.ownDriver);
                this.util.setItem('_vendorPromote', response.vendor.promote);
                this.util.setItem('_vendorCustomCategory', response.vendor.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.vendor.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.vendor.preBooking);
                this.util.setItem('_vendorTableOrder', response.vendor.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.vendor.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.vendor.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.vendor.ownKitchen);
              } else if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendorOutlet' && response.manager && response.manager.id) {
                this.util.setItem('_vendorId', response.vendor.id);
                this.util.setItem('_vendorPOS', response.manager.pos);
                this.util.setItem('_vendorOwnDriver', response.manager.ownDriver);
                this.util.setItem('_vendorPromote', response.manager.promote);
                this.util.setItem('_vendorCustomCategory', response.manager.customCategory);
                this.util.setItem('_vendorMultiOutlet', response.manager.multiOutlet);
                this.util.setItem('_vendorPreBooking', response.manager.preBooking);
                this.util.setItem('_vendorTableOrder', response.manager.tableOrder);
                this.util.setItem('_vendorTiffinSubscription', response.manager.tiffinSubscription);
                this.util.setItem('_vendorOwnWaiter', response.manager.ownWaiter);
                this.util.setItem('_vendorOwnKitchen', response.manager.ownKitchen);
              }
              this.router.navigate(['/vendor']);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  sendEmailOtpVerificationCode() {
    console.log(this.emailOtpForm);
    if (this.emailOtpForm.valid) {
      console.log('on login', this.emailOtpForm.value);
      try {
        this.isSubmit = true;
        const param = {
          'email': this.emailOtpForm.controls['email'].value,
          'locale': this.emailOtpForm.controls['locale'].value
        };
        this.api.post_public('v1/auth/vendor/login_eo_verification', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.sent) {
              this.emailOtpForm.controls['verificationId'].setValue(response.id);
              this.otpSent = true;
              this.otpLength = response.otpLength;
              this.canResendOtp = response.canResendOtp;
              this.provider = response.provider;
              this.emailOtpForm.controls['email'].disable();
              this.emailOtpForm.controls['verificationCode'].setValue('');

            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }

  }

  sendPhoneOtpVerificationCode() {
    console.log(this.phoneOtpForm);
    if (this.phoneOtpForm.valid) {
      console.log('on login', this.phoneOtpForm.value);
      try {
        this.isSubmit = true;
        const param = {
          'countryCode': this.phoneOtpForm.controls['countryCode'].value,
          'mobileNumber': this.phoneOtpForm.controls['mobileNumber'].value,
          'locale': this.phoneOtpForm.controls['locale'].value,
          'redirectUrl': `${window.location.origin}`
        };
        console.log(param);
        this.api.post_public('v1/auth/vendor/login_po_web_verification/', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.sent == false && response.target != 'web_modal') {
              this.phoneOtpForm.controls['id'].setValue(response.id);
              this.otpSent = true;
              this.otpLength = response.otpLength;
              this.canResendOtp = response.canResendOtp;
              this.provider = response.provider;
              this.countryCodeCtrl.disable();
              this.phoneOtpForm.controls['countryCode'].disable();
              this.phoneOtpForm.controls['mobileNumber'].disable();
              this.phoneOtpForm.controls['verificationCode'].setValue('');

            } else if (response && response.sent == false && response.target == 'web_modal' && response.method == 'msg91') {
              console.log('MSG91');
              const otpId = response.id;
              const webURL = `${this.api.baseUrl}v1/public/verification/otp_web_version/${otpId}`;
              window.location.href = webURL;
            } else if (response && response.sent == false && response.target == 'web_modal' && response.method == 'firebase') {
              console.log('Open Firebase');
              const otpId = response.id;
              const webURL = `${this.api.baseUrl}v1/public/verification/otp_web_version/${otpId}`;
              window.location.href = webURL;
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  verifyEmailOtp() {
    console.log('Submit');
    console.log(this.emailOtpForm);
    if (this.emailOtpForm.valid) {
      console.log('on login', this.emailOtpForm.value);
      try {
        this.isSubmit = true;
        const param = {
          'id': this.emailOtpForm.controls['verificationId'].value,
          'provider': this.provider,
          'otp': this.emailOtpForm.controls['verificationCode'].value,
        };
        console.log(param);
        this.api.post_public('v1/auth/verifyOTP', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.onEmailVerification();
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  verifyPhoneOtp() {
    console.log('Submit');
    console.log(this.phoneOtpForm);
    if (this.phoneOtpForm.valid) {
      console.log('on login', this.emailOtpForm.value);
      try {
        this.isSubmit = true;
        const param = {
          'id': this.phoneOtpForm.controls['id'].value,
          'provider': this.provider,
          'otp': this.phoneOtpForm.controls['verificationCode'].value,
        };
        console.log(param);
        this.api.post_public('v1/auth/verifyOTP', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            this.onPhoneVerification();
          }, error: (error: any) => {
            console.log(error);
            this.isSubmit = false;
            if (error && error.error && error.error.message != '') {
              const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
              this.util.onError(error.error.message, extra);
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }
        });
      } catch (error) {
        console.log('catch error', error);
        this.util.onError('ts_something_went_wrong', '');
      }
    }
  }

  onPhoneVerification() {
    console.log('Verification Success');
    try {
      this.isSubmit = true;
      const param = {
        'id': this.phoneOtpForm.controls['id'].value,
        'locale': this.phoneOtpForm.controls['locale'].value,
        'userAgent': this.phoneOtpForm.controls['userAgent'].value,
        'remember': this.phoneOtpForm.controls['remember'].value,
      };
      console.log(param);
      this.api.post_public('v1/auth/vendor/login_po_web/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false;
          if (response && response.user && response.user.id) {
            this.util.setItem('_uid', response.user.id);
            this.util.setItem('_authRole', response.user.role);
            this.util.setItem('_authEmail', response.user.email);
            this.util.setItem('_authFirstName', response.user.firstName);
            this.util.setItem('_authLastName', response.user.lastName);
            this.util.setItem('_authCoverImage', response.user.image);
            if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendor') {
              this.util.setItem('_vendorId', response.vendor.id);
              this.util.setItem('_vendorPOS', response.vendor.pos);
              this.util.setItem('_vendorOwnDriver', response.vendor.ownDriver);
              this.util.setItem('_vendorPromote', response.vendor.promote);
              this.util.setItem('_vendorCustomCategory', response.vendor.customCategory);
              this.util.setItem('_vendorMultiOutlet', response.vendor.multiOutlet);
              this.util.setItem('_vendorPreBooking', response.vendor.preBooking);
              this.util.setItem('_vendorTableOrder', response.vendor.tableOrder);
              this.util.setItem('_vendorTiffinSubscription', response.vendor.tiffinSubscription);
              this.util.setItem('_vendorOwnWaiter', response.vendor.ownWaiter);
              this.util.setItem('_vendorOwnKitchen', response.vendor.ownKitchen);
            } else if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendorOutlet' && response.manager && response.manager.id) {
              this.util.setItem('_vendorId', response.vendor.id);
              this.util.setItem('_vendorPOS', response.manager.pos);
              this.util.setItem('_vendorOwnDriver', response.manager.ownDriver);
              this.util.setItem('_vendorPromote', response.manager.promote);
              this.util.setItem('_vendorCustomCategory', response.manager.customCategory);
              this.util.setItem('_vendorMultiOutlet', response.manager.multiOutlet);
              this.util.setItem('_vendorPreBooking', response.manager.preBooking);
              this.util.setItem('_vendorTableOrder', response.manager.tableOrder);
              this.util.setItem('_vendorTiffinSubscription', response.manager.tiffinSubscription);
              this.util.setItem('_vendorOwnWaiter', response.manager.ownWaiter);
              this.util.setItem('_vendorOwnKitchen', response.manager.ownKitchen);
            }
            this.router.navigate(['/vendor']);
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.isSubmit = false;
          if (error && error.error && error.error.message != '') {
            const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
            this.util.onError(error.error.message, extra);
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }
      });
    } catch (error) {
      console.log('catch error', error);
      this.util.onError('ts_something_went_wrong', '');
    }
  }

  onEmailVerification() {
    console.log('Verification Success');
    try {
      this.isSubmit = true;
      const param = {
        'email': this.emailOtpForm.controls['email'].value,
        'locale': this.emailOtpForm.controls['locale'].value,
        'userAgent': this.emailOtpForm.controls['userAgent'].value,
        'remember': this.emailOtpForm.controls['remember'].value,
        'verificationId': this.emailOtpForm.controls['verificationId'].value,
        'verificationCode': this.emailOtpForm.controls['verificationCode'].value,
      };
      console.log(param);
      this.api.post_public('v1/auth/vendor/login_eo_web/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false;
          if (response && response.user && response.user.id) {
            this.util.setItem('_uid', response.user.id);
            this.util.setItem('_authRole', response.user.role);
            this.util.setItem('_authEmail', response.user.email);
            this.util.setItem('_authFirstName', response.user.firstName);
            this.util.setItem('_authLastName', response.user.lastName);
            this.util.setItem('_authCoverImage', response.user.image);
            if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendor') {
              this.util.setItem('_vendorId', response.vendor.id);
              this.util.setItem('_vendorPOS', response.vendor.pos);
              this.util.setItem('_vendorOwnDriver', response.vendor.ownDriver);
              this.util.setItem('_vendorPromote', response.vendor.promote);
              this.util.setItem('_vendorCustomCategory', response.vendor.customCategory);
              this.util.setItem('_vendorMultiOutlet', response.vendor.multiOutlet);
              this.util.setItem('_vendorPreBooking', response.vendor.preBooking);
              this.util.setItem('_vendorTableOrder', response.vendor.tableOrder);
              this.util.setItem('_vendorTiffinSubscription', response.vendor.tiffinSubscription);
              this.util.setItem('_vendorOwnWaiter', response.vendor.ownWaiter);
              this.util.setItem('_vendorOwnKitchen', response.vendor.ownKitchen);
            } else if (response && response.vendor && response.vendor.id && response.user.id == response.vendor.userId && response.user.role == 'vendorOutlet' && response.manager && response.manager.id) {
              this.util.setItem('_vendorId', response.vendor.id);
              this.util.setItem('_vendorPOS', response.manager.pos);
              this.util.setItem('_vendorOwnDriver', response.manager.ownDriver);
              this.util.setItem('_vendorPromote', response.manager.promote);
              this.util.setItem('_vendorCustomCategory', response.manager.customCategory);
              this.util.setItem('_vendorMultiOutlet', response.manager.multiOutlet);
              this.util.setItem('_vendorPreBooking', response.manager.preBooking);
              this.util.setItem('_vendorTableOrder', response.manager.tableOrder);
              this.util.setItem('_vendorTiffinSubscription', response.manager.tiffinSubscription);
              this.util.setItem('_vendorOwnWaiter', response.manager.ownWaiter);
              this.util.setItem('_vendorOwnKitchen', response.manager.ownKitchen);
            }
            this.router.navigate(['/vendor']);
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.isSubmit = false;
          if (error && error.error && error.error.message != '') {
            const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
            this.util.onError(error.error.message, extra);
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }
      });
    } catch (error) {
      console.log('catch error', error);
      this.util.onError('ts_something_went_wrong', '');
    }
  }

  resendOtp() {
    console.log('resend otp');
    let verificationId: string;
    if (this.restaurantLoginWith == 'email_otp') {
      verificationId = this.emailOtpForm.controls['verificationId'].value ?? '';
    } else {
      verificationId = this.phoneOtpForm.controls['id'].value ?? '';
    }
    const spinnerRef = this.util.start('ts_sending');
    this.api.get_private('v1/auth/resendOTP/' + verificationId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_otp_sent');
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.onError('ts_something_went_wrong', '');
      }
    });
  }

}
