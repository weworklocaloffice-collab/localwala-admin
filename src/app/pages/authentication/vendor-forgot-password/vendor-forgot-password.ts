import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
  selector: 'app-vendor-forgot-password',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './vendor-forgot-password.html',
})
export class VendorForgotPassword {

  resetWith: string = 'email_otp';
  emailForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    locale: new FormControl('en'),
    verificationId: new FormControl('none', [Validators.required]),
    verificationCode: new FormControl('none', [Validators.required]),
    token: new FormControl('none', [Validators.required]),
  });
  phoneForm = new FormGroup({
    countryCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required]),
    locale: new FormControl('en'),
    verificationId: new FormControl('none', [Validators.required]),
    verificationCode: new FormControl('none', [Validators.required]),
    token: new FormControl('none', [Validators.required]),
  });
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    verificationId: new FormControl('none', [Validators.required]),
  }, { validators: this.passwordMatchValidator })
  isSubmit: boolean = false;
  isPasswordSubmit: boolean = false;
  otpSent: boolean = false;
  otpLength: number = 0;
  canResendOtp: boolean = false;
  provider: string = '';
  otpVerified: boolean = false;
  showPassword: boolean = true;
  showConfirmPassword: boolean = true;
  countryCodes: Observable<CountryCodeInterface[]>;
  listOfCountryCodes: CountryCodeInterface[] = [];
  countryCodeCtrl = new FormControl();

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
  ) {
    this.phoneForm.controls['countryCode'].setValue(this.api.defaultCountryCode);
    this.getCountryCodes();
    this.resetWith = this.util.getItem('_restaurantResetPasswordWith');
    const defaultLocale = this.util.getItem('_appLocale');
    if (defaultLocale && defaultLocale != null && defaultLocale != '') {
      this.emailForm.controls['locale'].setValue(defaultLocale);
      this.phoneForm.controls['locale'].setValue(defaultLocale);
    } else {
      this.emailForm.controls['locale'].setValue('en');
      this.phoneForm.controls['locale'].setValue('en');
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

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get f() {
    return this.emailForm.controls;
  }

  get pForm() {
    return this.passwordForm.controls;
  }

  get ppf() {
    return this.phoneForm.controls;
  }

  onCountryCodeSelect(event: MatAutocompleteSelectedEvent) {
    console.log(event);
    if (event && event.option && event.option.value) {
      const splitString = event.option.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length) {
        this.phoneForm.controls['countryCode'].setValue(splitString[1]);
      }
    }
  }

  onSendOTP() {
    console.log(this.emailForm.value);
    console.log(this.phoneForm.value);
    if (this.resetWith == 'email_otp') {
      if (this.emailForm.valid) {
        console.log('on send otp', this.emailForm.value);
        try {
          this.isSubmit = true;
          const param = {
            'email': this.emailForm.controls['email'].value,
            'locale': this.emailForm.controls['locale'].value
          };
          this.api.post_public('v1/auth/forgot-password-email', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.isSubmit = false;
              if (response && response.sent == false) {
                this.emailForm.controls['verificationId'].setValue(response.id);
                this.passwordForm.controls['verificationId'].setValue(response.id);
                this.otpSent = true;
                this.otpLength = response.otpLength;
                this.canResendOtp = response.canResendOtp;
                this.provider = response.provider;
                this.emailForm.controls['email'].disable();
                this.emailForm.controls['verificationCode'].setValue('');
                this.emailForm.controls['token'].setValue(response.token);

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
    } else {
      if (this.phoneForm.valid) {
        console.log('on send otp', this.phoneForm.value);
        try {
          this.isSubmit = true;
          const param = {
            'countryCode': this.phoneForm.controls['countryCode'].value,
            'mobileNumber': this.phoneForm.controls['mobileNumber'].value,
            'locale': this.phoneForm.controls['locale'].value,
            'redirectUrl': `${window.location.origin}`
          };
          this.api.post_public('v1/auth/forgot-password-phone-web', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.isSubmit = false;
              if (response && response.sent == false && response.target != 'web_modal') {
                this.phoneForm.controls['verificationId'].setValue(response.id);
                this.passwordForm.controls['verificationId'].setValue(response.id);
                this.otpSent = true;
                this.otpLength = response.otpLength;
                this.canResendOtp = response.canResendOtp;
                this.provider = response.provider;
                this.phoneForm.controls['countryCode'].disable();
                this.countryCodeCtrl.disable();
                this.phoneForm.controls['mobileNumber'].disable();
                this.phoneForm.controls['verificationCode'].setValue('');
                this.phoneForm.controls['token'].setValue(response.token);

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
  }

  onVerifyOTP() {
    console.log('OTP verification');
    if (this.resetWith == 'email_otp') {
      if (this.emailForm.valid) {
        try {
          this.isSubmit = true;
          const param = {
            'id': this.emailForm.controls['verificationId'].value,
            'provider': this.provider,
            'otp': this.emailForm.controls['verificationCode'].value,
          };
          console.log(param);
          this.api.post_public('v1/auth/verifyOTP', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.isSubmit = false;
              this.otpVerified = true;
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
    } else {
      if (this.phoneForm.valid) {
        try {
          this.isSubmit = true;
          const param = {
            'id': this.phoneForm.controls['verificationId'].value,
            'provider': this.provider,
            'otp': this.phoneForm.controls['verificationCode'].value,
          };
          console.log(param);
          this.api.post_public('v1/auth/verifyOTP', param).subscribe({
            next: (response: any) => {
              console.log(response);
              this.isSubmit = false;
              this.otpVerified = true;
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
  }

  resendOtp() {
    console.log('resend otp');
    const verificationId = this.resetWith == 'email_otp' ? this.emailForm.controls['verificationId'].value : this.phoneForm.controls['verificationId'].value;
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

  updatePassword() {
    console.log(this.passwordForm);
    if (this.passwordForm.valid) {
      try {
        this.isPasswordSubmit = true;
        const token = this.resetWith == 'email_otp' ? this.emailForm.controls['token'].value : this.phoneForm.controls['token'].value;
        const param = {
          'password': this.passwordForm.controls['password'].value,
          'verificationId': this.passwordForm.controls['verificationId'].value,
          'token': token
        };

        this.api.post_public('v1/auth/reset-password', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isPasswordSubmit = false;
            if (response && response.success) {
              this.router.navigate(['/authentication/vendor']);
              this.util.onSuccess('ts_password_updated');
            } else {
              this.util.onError('ts_something_went_wrong', '');
            }
          }, error: (error: any) => {
            console.log(error);
            this.isPasswordSubmit = false;
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

}
