import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-marketing-package',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-marketing-package.html',
})
export class DialogLsMarketingPackage {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  isEdit: boolean = false;

  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    placement: new FormControl('home', [Validators.required]),
    targetingLevel: new FormControl('city', [Validators.required]),
    durationHours: new FormControl(24, [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    maxConcurrent: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(20)]),
    status: new FormControl(true, [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsMarketingPackage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public util: UtilService,
    public api: ApiService,
  ) {
    if (data && data.row) {
      this.isEdit = true;
      this.form.patchValue({
        code: data.row.code,
        name: data.row.name,
        placement: data.row.placement,
        targetingLevel: data.row.targetingLevel,
        durationHours: data.row.durationHours,
        price: data.row.price,
        maxConcurrent: data.row.maxConcurrent || 1,
        status: !!data.row.status,
      });
    }
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    this.isSubmit = true;
    const v: any = this.form.value;
    const payload: any = {
      code: v.code,
      name: v.name,
      placement: v.placement,
      targetingLevel: v.targetingLevel,
      durationHours: Number(v.durationHours),
      price: Number(v.price),
      maxConcurrent: Number(v.maxConcurrent),
      status: !!v.status,
    };
    const request = this.isEdit
      ? this.api.patch_private('v1/local-services/admin/marketing/packages/' + this.data.row._id, payload)
      : this.api.post_private('v1/local-services/admin/marketing/packages', payload);
    request.subscribe({
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
