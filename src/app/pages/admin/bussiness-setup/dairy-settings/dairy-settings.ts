/**
 * LocalWala – Local Commerce & Delivery Platform
 * (Angular)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * This source code is confidential. Unauthorized copying, redistribution,
 * resale, publication, modification or use in any public or commercial
 * repository is strictly prohibited.
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * The `dairy_settings` tab in Business Setup.
 *
 * Follows the same load/save/update shape as the other vertical settings screens, so
 * an operator who knows one knows this.
 *
 * Deliberately short. Most of the other verticals show a dozen switches; a good
 * number of those are stored and never read, which trains an operator to expect a
 * setting to do nothing. Here every field on this screen is either enforced
 * (`fefoWarningDays`) or explicitly marked as not yet enforced (`selfRegistration`).
 */
@Component({
  selector: 'app-dairy-settings',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dairy-settings.html',
})
export class DairySettings {
  action: string = 'add';
  id: string = '';
  haveSubmitClicked: boolean = false;
  isLoaded: boolean = false;

  settingForm = new FormGroup({
    fefoWarningDays: new FormControl(30, [
      Validators.required,
      Validators.min(1),
      Validators.max(365),
    ]),
    selfRegistration: new FormControl(true),
    subscriptionSkipCutoffHours: new FormControl(9, [
      Validators.required,
      Validators.min(0),
      Validators.max(48),
    ]),
  });

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getData();
  }

  getData() {
    this.isLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/dairy_settings/get').subscribe({
      next: (detail: any) => {
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        const response = detail && detail.settings;
        // `getSettings` falls back to model defaults when nothing is persisted, so
        // there is always a shape here. `patchValue` leaves the local defaults in
        // place for any field the API omits.
        if (response) {
          this.settingForm.patchValue({
            fefoWarningDays: response.fefoWarningDays,
            subscriptionSkipCutoffHours: response.subscriptionSkipCutoffHours,
            selfRegistration: response.selfRegistration,
          });
        }
        // Only treat it as 'edit' once a real document exists, otherwise the first
        // save must POST (create) rather than PATCH an unsaved id.
        if (response && response.id) {
          this.id = response.id;
          this.action = 'edit';
        }
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (!this.settingForm.valid) {
      return;
    }
    if (this.action === 'add') {
      this.onSave();
    } else {
      this.onUpdate();
    }
  }

  onSave() {
    const spinnerRef = this.util.start('ts_saving');
    this.api
      .post_private('v1/admin/dairy_settings/save', this.settingForm.getRawValue())
      .subscribe({
        next: (response: any) => {
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_dairy_setting_saved');
          if (response && response.id) {
            this.id = response.id;
            this.action = 'edit';
          }
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        },
      });
  }

  onUpdate() {
    const spinnerRef = this.util.start('ts_saving');
    this.api
      .patch_private('v1/admin/dairy_settings/update/' + this.id, this.settingForm.getRawValue())
      .subscribe({
        next: (response: any) => {
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_dairy_setting_updated');
        },
        error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        },
      });
  }

  onReset() {
    // Back to the shipped defaults, not to whatever was last saved.
    this.settingForm.reset({
      fefoWarningDays: 30,
      subscriptionSkipCutoffHours: 9,
      selfRegistration: true,
    });
    this.haveSubmitClicked = false;
  }

  get f() {
    return this.settingForm.controls;
  }
}
