import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-ls-facet',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-ls-facet.html',
})
export class DialogLsFacet {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  form = new FormGroup({
    key: new FormControl('', [Validators.required]),
    label: new FormControl('', [Validators.required]),
    dataType: new FormControl('ENUM', [Validators.required]),
    optionsText: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogLsFacet>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.form.invalid || this.isSubmit) return;
    this.isSubmit = true;
    const v: any = this.form.value;
    const options = String(v.optionsText || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    this.api.post_private('v1/local-services/admin/catalog/facets', {
      key: v.key,
      label: v.label,
      dataType: v.dataType,
      options,
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
