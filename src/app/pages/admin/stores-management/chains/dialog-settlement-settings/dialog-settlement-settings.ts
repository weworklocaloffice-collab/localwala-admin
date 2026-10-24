import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Per-chain settlement cadence and T+days.
 *
 * The generator cron reads `StoreChain.settings.settlementConfig`; before this
 * dialog existed the field had no writer, so every chain silently used the
 * hard-coded daily/T+2 default. The GET is deliberate: the dialog shows the
 * effective policy rather than assuming those defaults.
 */
@Component({
  selector: 'app-dialog-settlement-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-settlement-settings.html',
})
export class DialogSettlementSettings implements OnInit {
  chainId: string = '';
  loading = true;
  saving = false;
  error = '';

  form = new FormGroup({
    cadence: new FormControl('daily', [Validators.required]),
    tPlusDays: new FormControl<number | null>(2, [
      Validators.required,
      Validators.min(0),
      Validators.max(60),
    ]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogSettlementSettings>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.chainId = data && data.chain ? data.chain._id : '';
  }

  ngOnInit() {
    if (!this.chainId) {
      this.loading = false;
      this.error = 'No chain selected.';
      return;
    }

    this.api
      .get_private('v1/admin/stores/chains/' + this.chainId + '/settlement-config')
      .subscribe({
        next: (response: any) => {
          const config = response && response.settlementConfig ? response.settlementConfig : {};
          this.form.patchValue({
            cadence: config.cadence || 'daily',
            tPlusDays: config.tPlusDays !== undefined ? config.tPlusDays : 2,
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          this.error = 'Could not load the settlement policy.';
          this.util.handleError(error, 'admin');
        },
      });
  }

  get f() {
    return this.form.controls;
  }

  get cadence(): string {
    return this.f.cadence.value || 'daily';
  }

  onSubmit() {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const body = {
      cadence: this.f.cadence.value,
      tPlusDays: this.f.tPlusDays.value,
    };

    this.api
      .patch_private('v1/admin/stores/chains/' + this.chainId + '/settlement-config', body)
      .subscribe({
        next: (response: any) => {
          this.saving = false;
          this.dialogRef.close({ event: 'update', data: response });
        },
        error: (error: any) => {
          this.saving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
