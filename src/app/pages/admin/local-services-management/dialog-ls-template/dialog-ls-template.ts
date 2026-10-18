import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-template',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-template.html',
})
export class DialogLsTemplate {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  form = new FormGroup({
    key: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    bookingMode: new FormControl('SLOT', [Validators.required]),
    pricingMode: new FormControl('FIXED', [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsTemplate>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    this.isSubmit = true;
    this.api.post_private('v1/local-services/admin/catalog/templates', this.form.value).subscribe({
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
