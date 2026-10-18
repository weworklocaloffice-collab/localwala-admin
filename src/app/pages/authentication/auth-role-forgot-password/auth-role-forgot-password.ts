import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-auth-role-forgot-password',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './auth-role-forgot-password.html',
})
export class AuthRoleForgotPassword {

  form = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
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
  role: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    const roleList: string[] = ['admin', 'cityzen', 'support', 'accountant', 'bank'];
    const role = this.route.snapshot.paramMap.get('role') ?? '';
    if (roleList.includes(role)) {
      this.role = role;
      const defaultLocale = this.util.getItem('_appLocale');
      if (defaultLocale && defaultLocale != null && defaultLocale != '') {
        this.form.controls['locale'].setValue(defaultLocale);
      } else {
        this.form.controls['locale'].setValue('en');
      }
    } else {
      this.location.back();
      this.util.onError('ts_something_went_wrong', '');
    }

  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get f() {
    return this.form.controls;
  }

  get pForm() {
    return this.passwordForm.controls;
  }

  onSendOTP() {
    console.log(this.form.value);
    if (this.form.valid) {
      console.log('on send otp', this.form.value);
      try {
        this.isSubmit = true;
        const param = {
          'email': this.form.controls['email'].value,
          'locale': this.form.controls['locale'].value
        };
        this.api.post_public('v1/auth/forgot-password-email', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.id) {
              this.form.controls['verificationId'].setValue(response.id);
              this.passwordForm.controls['verificationId'].setValue(response.id);
              this.otpSent = true;
              this.otpLength = response.otpLength;
              this.canResendOtp = response.canResendOtp;
              this.provider = response.provider;
              this.form.controls['email'].disable();
              this.form.controls['verificationCode'].setValue('');
              this.form.controls['token'].setValue(response.token);

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

  onVerifyOTP() {
    console.log('OTP verification');
    if (this.form.valid) {
      try {
        this.isSubmit = true;
        const param = {
          'id': this.form.controls['verificationId'].value,
          'provider': this.provider,
          'otp': this.form.controls['verificationCode'].value,
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

  resendOtp() {
    console.log('resend otp');
    const verificationId = this.form.controls['verificationId'].value;
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
        const param = {
          'password': this.passwordForm.controls['password'].value,
          'verificationId': this.passwordForm.controls['verificationId'].value,
          'token': this.form.controls['token'].value
        };
        this.api.post_public('v1/auth/reset-password', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isPasswordSubmit = false;
            if (response && response.success) {
              this.router.navigate(['/authentication/' + this.role]);
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
