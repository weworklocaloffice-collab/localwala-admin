import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-chain',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-chain.html',
})
export class DialogChain {
  action: string = 'create';
  id: string = '';
  haveSubmitClicked: boolean = false;

  chainForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    key: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    status: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogChain>,
    public util: UtilService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (this.data && this.data.action == 'edit') {
      this.action = 'edit';
      const values = this.data.values;
      this.id = values._id;
      this.chainForm.patchValue({
        name: values.name,
        key: values.key,
        status: values.status === true,
      });
    }
  }

  get f() {
    return this.chainForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.chainForm.invalid) {
      return;
    }

    const value: any = this.chainForm.value;

    if (this.action == 'create') {
      this.api.post_private('v1/admin/stores/chains', value).subscribe({
        next: (response: any) => {
          this.dialogRef.close({ event: 'add', data: response });
        },
        error: (error: any) => {
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }

    const body: any = {
      name: value.name,
      key: value.key,
      status: value.status,
    };

    this.api.patch_private('v1/admin/stores/chains/' + this.id, body).subscribe({
      next: (response: any) => {
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }
}