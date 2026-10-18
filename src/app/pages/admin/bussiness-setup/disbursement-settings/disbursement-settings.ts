import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-disbursement-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './disbursement-settings.html',
})
export class DisbursementSettings {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    type: new FormControl('auto'),
    restaurant: new FormGroup({
      from: new FormControl('weekly'),
      weekStart: new FormControl(6),
      time: new FormControl('09:00'),
      minAmount: new FormControl(1000),
      dayComplete: new FormControl(7)
    }),
    driver: new FormGroup({
      from: new FormControl('weekly'),
      weekStart: new FormControl(6),
      time: new FormControl('09:00'),
      minAmount: new FormControl(1000),
      dayComplete: new FormControl(7)
    }),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getData();
  }

  getData() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/disbursement_settings/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          this.settingForm.controls['type'].setValue(response.type);
          if (response && response.type && response.type == 'auto') {
            if (response && response.restaurant && response.restaurant != null) {
              const restaurant = response.restaurant;
              this.settingForm.controls['restaurant'].controls['dayComplete'].setValue(parseInt(restaurant.dayComplete));
              this.settingForm.controls['restaurant'].controls['from'].setValue(restaurant.from);
              this.settingForm.controls['restaurant'].controls['minAmount'].setValue(parseFloat(restaurant.minAmount));
              this.settingForm.controls['restaurant'].controls['time'].setValue(restaurant.time);
              this.settingForm.controls['restaurant'].controls['weekStart'].setValue(parseInt(restaurant.weekStart));
            }

            if (response && response.driver && response.driver != null) {
              const driver = response.driver;
              this.settingForm.controls['driver'].controls['dayComplete'].setValue(parseInt(driver.dayComplete));
              this.settingForm.controls['driver'].controls['from'].setValue(driver.from);
              this.settingForm.controls['driver'].controls['minAmount'].setValue(parseFloat(driver.minAmount));
              this.settingForm.controls['driver'].controls['time'].setValue(driver.time);
              this.settingForm.controls['driver'].controls['weekStart'].setValue(parseInt(driver.weekStart));
            }
          }
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
    this.api.post_private('v1/admin/disbursement_settings/save', this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_disbursement_setting_saved');
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
    this.api.patch_private('v1/admin/disbursement_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_disbursement_setting_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  onReset() {
    console.log('reset');
    this.settingForm.patchValue({
      type: 'auto',
      restaurant: {
        from: 'weekly',
        weekStart: 6,
        time: '09:00',
        minAmount: 1000,
        dayComplete: 7
      },
      driver: {
        from: 'weekly',
        weekStart: 6,
        time: '09:00',
        minAmount: 1000,
        dayComplete: 7
      }
    });
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }

}
