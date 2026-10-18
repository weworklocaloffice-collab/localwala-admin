import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-waiter-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './waiter-settings.html',
})
export class WaiterSettings {
  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    waiterLoginWith: new FormControl('email_password'),
    waiterResetPasswordWith: new FormControl('email_otp'),
    getTip: new FormControl(true),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getData();
  }

  getData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/waiter_settings/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          this.id = response.settings.id;
          this.action = 'edit';
          this.settingForm.controls['waiterLoginWith'].setValue(response.settings.waiterLoginWith);
          this.settingForm.controls['waiterResetPasswordWith'].setValue(response.settings.waiterResetPasswordWith);
          this.settingForm.controls['getTip'].setValue(response.settings.getTip);
        }

      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
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
    this.api.post_private('v1/admin/waiter_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_waiter_setting_saved');
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
    this.api.patch_private('v1/admin/waiter_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_waiter_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      waiterLoginWith: 'email_password',
      waiterResetPasswordWith: 'email_otp',
      getTip: true,
    });
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

}
