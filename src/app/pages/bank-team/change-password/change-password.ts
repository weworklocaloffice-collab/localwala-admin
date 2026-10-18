import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-bank-change-password',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  password: string = '';
  confirmPassword: string = '';
  isSaving: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  onSubmit() {
    if (!this.password || this.password !== this.confirmPassword) {
      return;
    }
    const uid = this.util.getItem('_uid');
    this.isSaving = true;
    this.api
      .patch_private(`v1/realestate/bank/update_password/${uid}`, { password: this.password })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.password = '';
          this.confirmPassword = '';
          this.util.onSuccess('ts_password_updated');
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
