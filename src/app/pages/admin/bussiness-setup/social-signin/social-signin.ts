import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-social-signin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './social-signin.html',
})
export class SocialSignin {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    appleSignin: new FormControl(false),
    googleSignin: new FormControl(false),
    facebookSignin: new FormControl(false),
    configCredsRaw: new FormGroup({
      google_client_id: new FormControl(''),
      google_server_id: new FormControl(''),
    }),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getList();
  }

  getList() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/admin/social_signin/getList').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          console.log('ID -->', this.id);
          this.settingForm.controls['appleSignin'].setValue(response.appleSignin);
          this.settingForm.controls['facebookSignin'].setValue(response.facebookSignin);
          this.settingForm.controls['googleSignin'].setValue(response.googleSignin);
          this.settingForm.controls['configCredsRaw'].controls['google_client_id'].setValue(response.configCredsRaw.google_client_id);
          this.settingForm.controls['configCredsRaw'].controls['google_server_id'].setValue(response.configCredsRaw.google_server_id);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.settingForm.controls;
  }

  onReset() {
    console.log('Reset');
    this.settingForm.patchValue({
      appleSignin: false,
      googleSignin: false,
      facebookSignin: false,
      configCredsRaw: {
        google_client_id: '',
        google_server_id: ''
      }
    });
    this.haveSubmitClicked = false;
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.settingForm);
    console.log(this.settingForm.getRawValue());
    this.haveSubmitClicked = true;
    if (this.settingForm.valid) {
      if (this.action == 'add') {
        this.onSave();
      } else {
        this.onUpdate();
      }
    }
  }

  onSave() {
    console.log('on save');
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/social_signin/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_saved');
        if (response && response.id) {
          this.id = response.id;
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
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/social_signin/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
