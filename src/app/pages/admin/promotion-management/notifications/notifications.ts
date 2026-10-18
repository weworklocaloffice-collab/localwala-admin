import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateNotification } from "./translate-notification/translate-notification";

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, TranslateNotification],
  templateUrl: './notifications.html',
})
export class Notifications {

  tabIndex: number = 0;
  notificationForm = new FormGroup({
    to: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;
  isSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

  get f() {
    return this.notificationForm.controls;
  }

  onReset() {
    console.log('on reset');
    console.log(this.notificationForm);
    console.log(this.notificationForm.getRawValue());
    this.haveSubmitClicked = false;
    this.isSubmit = false;
    this.notificationForm.reset();
    this.notificationForm.controls['to'].setValue('all');
    this.notificationForm.controls['title'].setValue('');
    this.notificationForm.controls['description'].setValue('');
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.notificationForm.valid) {
      console.log('Form', this.notificationForm.getRawValue());
      this.isSubmit = true;
      this.api.post_private('v1/admin/send_notification', this.notificationForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.onSuccess('ts_notification_sent');
          this.onReset();
        }, error: (error: any) => {
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
