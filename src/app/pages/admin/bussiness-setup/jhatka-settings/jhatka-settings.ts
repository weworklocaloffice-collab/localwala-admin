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
 * The `jhatka_settings` tab in Business Setup.
 *
 * Follows the same load/save/update shape as the dairy settings screen, so
 * an operator who knows one knows this.
 *
 * Every field on this screen is READ — by the weigh policy, the subscription
 * pricer, the dispatch guard or the occurrence generator — with the model
 * default as fallback. There is deliberately no field that is stored and
 * never read: an operator who changes a setting and sees nothing happen
 * loses trust in every other setting on the screen.
 */
@Component({
  selector: 'app-jhatka-settings',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './jhatka-settings.html',
})
export class JhatkaSettings {
  action: string = 'add';
  id: string = '';
  haveSubmitClicked: boolean = false;
  isLoaded: boolean = false;

  settingForm = new FormGroup({
    weightTolerancePct: new FormControl(5, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    weightHardOverchargePct: new FormControl(10, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    weightHardShortfallPct: new FormControl(2, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    subscriptionCeilingPct: new FormControl(10, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    editCutoffHours: new FormControl(12, [
      Validators.required,
      Validators.min(0),
      Validators.max(168),
    ]),
    codTolerancePct: new FormControl(10, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    maxTransitMinutes: new FormControl(120, [
      Validators.required,
      Validators.min(1),
      Validators.max(1440),
    ]),
  });

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getData();
  }

  get f() {
    return this.settingForm.controls;
  }

  getData() {
    this.isLoaded = false;
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/admin/jhatka_settings/get').subscribe({
      next: (detail: any) => {
        this.isLoaded = true;
        this.util.stop(spinnerRef);
        const response = detail && detail.settings;
        // `getSettings` falls back to model defaults when nothing is persisted, so
        // there is always a shape here. `patchValue` leaves the local defaults in
        // place for any field the API omits.
        if (response) {
          this.settingForm.patchValue({
            weightTolerancePct: response.weightTolerancePct,
            weightHardOverchargePct: response.weightHardOverchargePct,
            weightHardShortfallPct: response.weightHardShortfallPct,
            subscriptionCeilingPct: response.subscriptionCeilingPct,
            editCutoffHours: response.editCutoffHours,
            codTolerancePct: response.codTolerancePct,
            maxTransitMinutes: response.maxTransitMinutes,
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
    if (this.settingForm.invalid) {
      return;
    }
    const spinnerRef = this.util.start('ts_saving');
    const body = this.settingForm.value;
    const request =
      this.action === 'edit' && this.id
        ? this.api.patch_private(`v1/admin/jhatka_settings/update/${this.id}`, body)
        : this.api.post_private('v1/admin/jhatka_settings/save', body);
    request.subscribe({
      next: () => {
        this.util.stop(spinnerRef);
        this.haveSubmitClicked = false;
        this.getData();
      },
      error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      },
    });
  }
}
