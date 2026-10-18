import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-kitchen-owner-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './kitchen-owner-settings.html',
})
export class KitchenOwnerSettings {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    ownerLoginWith: new FormControl('email_password'),
    ownerResetPasswordWith: new FormControl('email_otp'),
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
    this.api.get_private('v1/admin/kitchen_owner_setting/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.settings && response.settings.id) {
          this.id = response.settings.id;
          this.action = 'edit';
          this.settingForm.controls['ownerLoginWith'].setValue(response.settings.ownerLoginWith);
          this.settingForm.controls['ownerResetPasswordWith'].setValue(response.settings.ownerResetPasswordWith);
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
    this.api.post_private('v1/admin/kitchen_owner_setting/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_kitchen_owner_setting_saved');
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
    this.api.patch_private('v1/admin/kitchen_owner_setting/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_kitchen_owner_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      ownerLoginWith: 'email_password',
      ownerResetPasswordWith: 'email_otp',
    });
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

}
