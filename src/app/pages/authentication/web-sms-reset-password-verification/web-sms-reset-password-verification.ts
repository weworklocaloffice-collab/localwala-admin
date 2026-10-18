import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-web-sms-reset-password-verification',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './web-sms-reset-password-verification.html',
})
export class WebSmsResetPasswordVerification {

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    verificationId: new FormControl('none', [Validators.required]),
  }, { validators: this.passwordMatchValidator })
  id: string = '';
  isPasswordSubmit: boolean = false;
  showPassword: boolean = true;
  showConfirmPassword: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public util: UtilService,
    private router: Router,
    private api: ApiService
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id != null && this.id != '') {
      console.log('OK');
      this.passwordForm.controls['verificationId'].setValue(this.id);
    } else {
      this.util.onError('ts_verification_failed', '');
      this.router.navigate(['/authentication/vendor'], {
        replaceUrl: true,
        state: { flushed: true }
      });
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get pForm() {
    return this.passwordForm.controls;
  }

  updatePassword() {
    console.log(this.passwordForm);
    if (this.passwordForm.valid) {
      try {
        this.isPasswordSubmit = true;
        const param = {
          'verificationId': this.passwordForm.controls['verificationId'].value,
          'password': this.passwordForm.controls['password'].value,
        };
        this.api.post_public('v1/auth/reset-web-password', param).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isPasswordSubmit = false;
            if (response && response.success) {
              this.router.navigate(['/authentication/vendor'], {
                replaceUrl: true,
                state: { flushed: true }
              });
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
