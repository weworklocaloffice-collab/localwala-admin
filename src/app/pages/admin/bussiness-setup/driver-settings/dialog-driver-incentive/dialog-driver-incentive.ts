import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-driver-incentive',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-driver-incentive.html',
})
export class DialogDriverIncentive {

  action: string = 'create';
  incentiveForm = new FormGroup({
    orderTotal: new FormControl('', [Validators.required]),
    incentiveAmount: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  id: string = '';
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogDriverIncentive>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.incentiveForm.controls['orderTotal'].setValue(values && values.orderTotal ? values.orderTotal : '');
      this.incentiveForm.controls['incentiveAmount'].setValue(values && values.incentiveAmount ? values.incentiveAmount : '');
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log(this.incentiveForm);
    if (this.incentiveForm.valid) {
      if (this.action == 'create') {
        this.saveIncentive();
      } else {
        this.updateIncentive();
      }
    }
  }

  saveIncentive() {
    this.isSubmit = true;
    this.api.post_private('v1/admin/driver_incentive/save', this.incentiveForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_incentive_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateIncentive() {
    this.isSubmit = true;
    this.api.patch_private('v1/admin/driver_incentive/update/' + this.id, this.incentiveForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_incentive_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.incentiveForm.controls;
  }

}
