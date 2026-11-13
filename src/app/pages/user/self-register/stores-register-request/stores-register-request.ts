import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-stores-register-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './stores-register-request.html',
})
export class StoresRegisterRequest {
  isLoading: boolean = false;
  serviceForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$')])),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('+91', [Validators.required]),
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
  });

  otpId: string = '';
  otpCode: string = '';
  otpSent: boolean = false;
  otpVerified: boolean = false;
  submitting: boolean = false;
  alertMessage: string = '';

  constructor(public api: ApiService, public util: UtilService, private router: Router) {}

  sendOtp() {
    if (this.serviceForm.get('mobile')?.invalid || this.serviceForm.get('countryCode')?.invalid) {
      this.alertMessage = 'Enter a valid mobile number';
      return;
    }
    this.isLoading = true;
    this.alertMessage = '';
    const countryCode = this.serviceForm.get('countryCode')?.value?.replace('+', '') || '91';
    const mobileNumber = this.serviceForm.get('mobile')?.value || '';
    this.api.post_public('v1/stores/auth/register/send_otp', {
      countryCode: countryCode,
      mobileNumber: mobileNumber,
      locale: 'en',
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.id) {
          this.otpId = response.id;
          this.otpSent = true;
          this.alertMessage = 'OTP sent successfully';
        } else {
          this.alertMessage = response?.message || 'Failed to send OTP';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.alertMessage = error?.error?.message || 'Failed to send OTP';
      },
    });
  }

  verifyOtp() {
    if (this.otpCode.length !== 6) {
      this.alertMessage = 'Enter 6-digit OTP';
      return;
    }
    this.isLoading = true;
    this.api.post_public('v1/auth/verifyOTP', {
      id: this.otpId,
      provider: 'app',
      otp: this.otpCode,
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.otpVerified = true;
        this.alertMessage = 'OTP verified';
        this.submit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.alertMessage = error?.error?.message || 'OTP verification failed';
      },
    });
  }

  submit() {
    if (this.serviceForm.invalid || !this.otpVerified) {
      this.alertMessage = 'Please fill all required fields and verify OTP';
      return;
    }
    this.submitting = true;
    this.alertMessage = '';
    const payload = {
      id: this.otpId,
      firstName: this.serviceForm.get('firstName')?.value,
      lastName: this.serviceForm.get('lastName')?.value,
      countryCode: this.serviceForm.get('countryCode')?.value,
      mobile: this.serviceForm.get('mobile')?.value,
      email: this.serviceForm.get('email')?.value,
      password: this.serviceForm.get('password')?.value,
      locale: 'en',
      remember: true,
      userAgent: 'web',
    };
    this.api.post_public('v1/stores/auth/register/partner', payload).subscribe({
      next: (response: any) => {
        this.submitting = false;
        this.alertMessage = 'Registration successful! Download the Partner app to complete your store onboarding.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error: any) => {
        this.submitting = false;
        this.alertMessage = error?.error?.message || 'Registration failed';
      },
    });
  }
}
