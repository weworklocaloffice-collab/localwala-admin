import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-delivery-shift-schedule',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-delivery-shift-schedule.html',
})
export class DialogDeliveryShiftSchedule {

  action: string = 'create';
  shiftForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
    extraEarningPercentage: new FormControl(0, [Validators.required]),
  });
  isSubmit: boolean = false;
  id: string = '';
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogDeliveryShiftSchedule>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.shiftForm.controls['name'].setValue(values && values.name ? values.name : '');
      this.shiftForm.controls['startTime'].setValue(values && values.startTime ? values.startTime : '');
      this.shiftForm.controls['endTime'].setValue(values && values.endTime ? values.endTime : '');
      this.shiftForm.controls['extraEarningPercentage'].setValue(values && values.extraEarningPercentage ? values.extraEarningPercentage : 0);
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action);
    console.log(this.shiftForm);
    if (this.shiftForm.valid) {
      if (this.action == 'create') {
        this.saveShift();
      } else {
        this.updateShift();
      }
    }
  }

  saveShift() {
    console.log('create');
    this.isSubmit = true;
    this.api.post_private('v1/admin/deliveryShiftSchedule/save', this.shiftForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_shift_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  updateShift() {
    console.log('update');
    this.isSubmit = true;
    this.api.patch_private('v1/admin/deliveryShiftSchedule/update/' + this.id, this.shiftForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false;
        this.util.onSuccess('ts_shift_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        console.log(error);
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  get f() {
    return this.shiftForm.controls;
  }

}
