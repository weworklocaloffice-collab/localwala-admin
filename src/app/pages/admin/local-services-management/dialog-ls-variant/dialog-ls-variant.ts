import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-variant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-variant.html',
})
export class DialogLsVariant {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  form = new FormGroup({
    service: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    basePrice: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsVariant>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    this.isSubmit = true;
    this.api.post_private('v1/local-services/admin/catalog/variants', this.form.value).subscribe({
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
