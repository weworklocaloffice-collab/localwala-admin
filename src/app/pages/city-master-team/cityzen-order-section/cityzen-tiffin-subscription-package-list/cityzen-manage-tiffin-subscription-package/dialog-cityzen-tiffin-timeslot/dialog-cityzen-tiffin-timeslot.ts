import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-tiffin-timeslot',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-tiffin-timeslot.html',
})
export class DialogCityzenTiffinTimeslot {

  action: string = 'create';
  slotForm = new FormGroup({
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogCityzenTiffinTimeslot>,
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
    if (this.slotForm.valid) {
      if (this.action == 'create') {
        this.saveSlot();
      } else {
        this.updateSlot();
      }
    }
  }

  saveSlot() {
    this.dialogRef.close({ event: 'add', data: this.slotForm.getRawValue() });
  }

  updateSlot() {
    this.dialogRef.close({ event: 'update', data: this.slotForm.getRawValue() });
  }

  get f() {
    return this.slotForm.controls;
  }

}
