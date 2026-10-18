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
import { UtilService } from 'src/app/services/util-service';
import { DairyVerticalInterface } from '../verticals/verticals';

@Component({
  selector: 'app-dialog-vertical-status',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-vertical-status.html',
})
export class ConfirmVerticalStatusDialog {
  haveSubmitClicked: boolean = false;
  vertical: DairyVerticalInterface;
  outletCount: number = 0;

  confirmForm = new FormGroup({
    reason: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  constructor(
    public dialogRef: MatDialogRef<ConfirmVerticalStatusDialog>,
    public util: UtilService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.vertical = data.vertical;
    this.outletCount = this.vertical.businessCount || 0;
  }

  get f() {
    return this.confirmForm.controls;
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.confirmForm.invalid) {
      return;
    }
    this.dialogRef.close({ action: 'confirm', reason: this.f['reason'].value });
  }

  onCancel() {
    this.dialogRef.close({ action: 'cancel' });
  }
}
