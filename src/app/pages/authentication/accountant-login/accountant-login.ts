import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-accountant-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './accountant-login.html',
})
export class AccountantLogin {
  form = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
    userAgent: new FormControl('browser')
  });

  showPassword: boolean = true;
  isSubmit: boolean = false;

  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService,
  ) {
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    console.log(this.form);
    if (this.form.valid) {
      console.log('on login', this.form.value);
      try {
        this.isSubmit = true;
        this.api.post_public('v1/auth/accountant/login', this.form.value).subscribe({
          next: (response: any) => {
            console.log(response);
            this.isSubmit = false;
            if (response && response.user && response.user.id) {
              this.util.setItem('_uid', response.user.id);
              this.util.setItem('_authRole', 'accountant');
              this.util.setItem('_authEmail', response.user.email);
              this.util.setItem('_authFirstName', response.user.firstName);
              this.util.setItem('_authLastName', response.user.lastName);
              this.util.setItem('_authCoverImage', response.user.image);
              this.router.navigate(['/accountant-team']);
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
