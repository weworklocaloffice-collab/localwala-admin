import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-plan',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-plan.html',
})
export class DialogLsPlan {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    interval: new FormControl('monthly', [Validators.required]),
    entitlementsText: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsPlan>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    this.isSubmit = true;
    const v: any = this.form.value;
    const entitlements = String(v.entitlementsText || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    this.api.post_private('v1/local-services/admin/plans', {
      code: v.code,
      name: v.name,
      price: Number(v.price),
      interval: v.interval,
      entitlements,
    }).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
