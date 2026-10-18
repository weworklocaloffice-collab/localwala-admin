import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-email-config-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './email-config-settings.html',
})
export class EmailConfigSettings {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    smtpHost: new FormControl('', [Validators.required]),
    smtpPort: new FormControl('', [Validators.required]),
    smtpUsername: new FormControl('', [Validators.required]),
    smtpPassword: new FormControl('', [Validators.required]),
    smtpFromEmail: new FormControl('', [Validators.required]),
    smtpFromName: new FormControl('', [Validators.required]),
    smtpDriver: new FormControl('', [Validators.required]),
    smtpEncryption: new FormControl('', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;
  demoForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])),
  });
  haveDemoSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getSettings();
  }

  getSettings() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/email_config/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          this.settingForm.controls['smtpDriver'].setValue(response.smtpDriver);
          this.settingForm.controls['smtpEncryption'].setValue(response.smtpEncryption);
          this.settingForm.controls['smtpFromEmail'].setValue(response.smtpFromEmail);
          this.settingForm.controls['smtpHost'].setValue(response.smtpHost);

          this.settingForm.controls['smtpPassword'].setValue(response.smtpPassword);
          this.settingForm.controls['smtpPort'].setValue(response.smtpPort);
          this.settingForm.controls['smtpUsername'].setValue(response.smtpUsername);
          this.settingForm.controls['smtpFromName'].setValue(response.smtpFromName);
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
    console.log('on save', this.settingForm.value);
    const spinnerRef = this.util.start('ts_saving');
    this.api.post_private('v1/admin/email_config/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_setting_saved');
        if (response && response.id) {
          this.action = 'edit';
          this.id = response.id;
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUpdate() {
    console.log('on update', this.settingForm.value);
    const spinnerRef = this.util.start('ts_saving');
    this.api.patch_private('v1/admin/email_config/update/' + this.id, this.settingForm.getRawValue()).subscribe({
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

  get f() {
    return this.settingForm.controls;
  }

  get demoF() {
    return this.demoForm.controls;
  }

  onReset() {
    console.log('Reset');
    this.settingForm.patchValue({
      smtpHost: '',
      smtpPort: '',
      smtpUsername: '',
      smtpPassword: '',
      smtpFromEmail: '',
      smtpFromName: '',
      smtpDriver: '',
      smtpEncryption: ''
    });
    this.haveSubmitClicked = false;
    this.demoForm.reset();
    this.haveDemoSubmitClicked = false;
  }

  onDemoSubmit() {
    console.log('on submit');
    this.haveDemoSubmitClicked = true;
    if (this.demoForm.valid) {
      const spinnerRef = this.util.start('ts_sending');
      this.api.get_private('v1/admin/email_config/sendDemo/' + this.demoForm.controls['email'].value).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_mail_sent');
          this.demoForm.reset();
          this.haveDemoSubmitClicked = false;
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
