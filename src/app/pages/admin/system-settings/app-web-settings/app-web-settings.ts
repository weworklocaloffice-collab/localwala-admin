import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-app-web-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './app-web-settings.html',
})
export class AppWebSettings {

  action: string = 'add';
  id: string = '';
  settingForm = new FormGroup({
    showPopularFood: new FormControl(true),
    showMostReviewedFood: new FormControl(true),
    showTodaysTrendingFood: new FormControl(true),
    showPopularRestaurant: new FormControl(true),
    showNewRestaurant: new FormControl(true),
    showTiffinSubscriptionPackages: new FormControl(true),
    showPopularDiningRestaurant: new FormControl(true),
    showNewDiningRestaurant: new FormControl(true),
    userAndroidForceUpdateVersion: new FormControl('', [Validators.required]),
    userAndroidUpdateUrl: new FormControl('', [Validators.required]),
    useriOSForceUpdateVersion: new FormControl('', [Validators.required]),
    useriOSUpdateUrl: new FormControl('', [Validators.required]),
    vendorAndroidForceUpdateVersion: new FormControl('', [Validators.required]),
    vendorAndroidUpdateUrl: new FormControl('', [Validators.required]),
    vendoriOSForceUpdateVersion: new FormControl('', [Validators.required]),
    vendoriOSUpdateUrl: new FormControl('', [Validators.required]),
    deliveryManAndroidForceUpdateVersion: new FormControl('', [Validators.required]),
    deliveryManAndroidUpdateUrl: new FormControl('', [Validators.required]),
    deliveryManiOSForceUpdateVersion: new FormControl('', [Validators.required]),
    deliveryManiOSUpdateUrl: new FormControl('', [Validators.required]),
    waiterAndroidForceUpdateVersion: new FormControl('', [Validators.required]),
    waiterAndroidUpdateUrl: new FormControl('', [Validators.required]),
    waiteriOSForceUpdateVersion: new FormControl('', [Validators.required]),
    waiteriOSUpdateUrl: new FormControl('', [Validators.required]),
    kitchenAndroidForceUpdateVersion: new FormControl('', [Validators.required]),
    kitchenAndroidUpdateUrl: new FormControl('', [Validators.required]),
    kitcheniOSForceUpdateVersion: new FormControl('', [Validators.required]),
    kitcheniOSUpdateUrl: new FormControl('', [Validators.required]),
  });
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getSettings();
  }

  getSettings() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/app_web_settings/get').subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
          this.settingForm.controls['deliveryManAndroidForceUpdateVersion'].setValue(response.deliveryManAndroidForceUpdateVersion);
          this.settingForm.controls['deliveryManAndroidUpdateUrl'].setValue(response.deliveryManAndroidUpdateUrl);
          this.settingForm.controls['deliveryManiOSForceUpdateVersion'].setValue(response.deliveryManiOSForceUpdateVersion);
          this.settingForm.controls['deliveryManiOSUpdateUrl'].setValue(response.deliveryManiOSUpdateUrl);

          this.settingForm.controls['showMostReviewedFood'].setValue(response.showMostReviewedFood);
          this.settingForm.controls['showNewRestaurant'].setValue(response.showNewRestaurant);
          this.settingForm.controls['showPopularFood'].setValue(response.showPopularFood);
          this.settingForm.controls['showPopularRestaurant'].setValue(response.showPopularRestaurant);
          this.settingForm.controls['showTiffinSubscriptionPackages'].setValue(response.showTiffinSubscriptionPackages);

          this.settingForm.controls['showPopularDiningRestaurant'].setValue(response.showPopularDiningRestaurant);
          this.settingForm.controls['showNewDiningRestaurant'].setValue(response.showNewDiningRestaurant);

          this.settingForm.controls['userAndroidForceUpdateVersion'].setValue(response.userAndroidForceUpdateVersion);
          this.settingForm.controls['userAndroidUpdateUrl'].setValue(response.userAndroidUpdateUrl);
          this.settingForm.controls['useriOSForceUpdateVersion'].setValue(response.useriOSForceUpdateVersion);
          this.settingForm.controls['useriOSUpdateUrl'].setValue(response.useriOSUpdateUrl);

          this.settingForm.controls['vendorAndroidForceUpdateVersion'].setValue(response.vendorAndroidForceUpdateVersion);
          this.settingForm.controls['vendorAndroidUpdateUrl'].setValue(response.vendorAndroidUpdateUrl);
          this.settingForm.controls['vendoriOSForceUpdateVersion'].setValue(response.vendoriOSForceUpdateVersion);
          this.settingForm.controls['vendoriOSUpdateUrl'].setValue(response.vendoriOSUpdateUrl);

          this.settingForm.controls['waiterAndroidForceUpdateVersion'].setValue(response.waiterAndroidForceUpdateVersion);
          this.settingForm.controls['waiterAndroidUpdateUrl'].setValue(response.waiterAndroidUpdateUrl);
          this.settingForm.controls['waiteriOSForceUpdateVersion'].setValue(response.waiteriOSForceUpdateVersion);
          this.settingForm.controls['waiteriOSUpdateUrl'].setValue(response.waiteriOSUpdateUrl);

          this.settingForm.controls['kitchenAndroidForceUpdateVersion'].setValue(response.kitchenAndroidForceUpdateVersion);
          this.settingForm.controls['kitchenAndroidUpdateUrl'].setValue(response.kitchenAndroidUpdateUrl);
          this.settingForm.controls['kitcheniOSForceUpdateVersion'].setValue(response.kitcheniOSForceUpdateVersion);
          this.settingForm.controls['kitcheniOSUpdateUrl'].setValue(response.kitcheniOSUpdateUrl);
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
    this.api.post_private('v1/admin/app_web_settings/save', this.settingForm.getRawValue()).subscribe({
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
    this.api.patch_private('v1/admin/app_web_settings/update/' + this.id, this.settingForm.getRawValue()).subscribe({
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

  onReset() {
    console.log('Reset');
    this.settingForm.patchValue({
      showPopularFood: true,
      showMostReviewedFood: true,
      showTodaysTrendingFood: true,
      showPopularRestaurant: true,
      showNewRestaurant: true,
      showTiffinSubscriptionPackages: true,
      showPopularDiningRestaurant: true,
      showNewDiningRestaurant: true,
      userAndroidForceUpdateVersion: '',
      userAndroidUpdateUrl: '',
      useriOSForceUpdateVersion: '',
      useriOSUpdateUrl: '',
      vendorAndroidForceUpdateVersion: '',
      vendorAndroidUpdateUrl: '',
      vendoriOSForceUpdateVersion: '',
      vendoriOSUpdateUrl: '',
      deliveryManAndroidForceUpdateVersion: '',
      deliveryManAndroidUpdateUrl: '',
      deliveryManiOSForceUpdateVersion: '',
      deliveryManiOSUpdateUrl: '',
      waiterAndroidForceUpdateVersion: '',
      waiterAndroidUpdateUrl: '',
      waiteriOSForceUpdateVersion: '',
      waiteriOSUpdateUrl: '',
      kitchenAndroidForceUpdateVersion: '',
      kitchenAndroidUpdateUrl: '',
      kitcheniOSForceUpdateVersion: '',
      kitcheniOSUpdateUrl: ''
    });
    this.haveSubmitClicked = false;
  }

}
