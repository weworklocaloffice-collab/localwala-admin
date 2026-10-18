import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-admin-tiffin-subscription-timeslot',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-admin-tiffin-subscription-timeslot.html',
})
export class DialogAdminTiffinSubscriptionTimeslot {

  action: string = 'create';
  slotForm = new FormGroup({
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogAdminTiffinSubscriptionTimeslot>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.slotForm.controls['startTime'].setValue(values && values.startTime ? values.startTime : '');
      this.slotForm.controls['endTime'].setValue(values && values.endTime ? values.endTime : '');
    }
  }


  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.action);

    console.log(this.slotForm);
    if (this.slotForm.valid) {
      if (this.action == 'create') {
        this.saveSlot();
      } else {
        this.updateSlot();
      }
    }
  }

  saveSlot() {
    console.log('save notice');
    this.dialogRef.close({ event: 'add', data: this.slotForm.getRawValue() });
  }

  updateSlot() {
    console.log('update notice');
    this.dialogRef.close({ event: 'update', data: this.slotForm.getRawValue() });
  }

  get f() {
    return this.slotForm.controls;
  }

}
