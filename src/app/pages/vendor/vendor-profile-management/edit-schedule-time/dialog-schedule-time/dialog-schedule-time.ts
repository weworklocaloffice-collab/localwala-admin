import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-schedule-time',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-schedule-time.html',
})
export class DialogScheduleTime {

  action: string = 'create';
  scheduleForm = new FormGroup({
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogScheduleTime>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public util: UtilService
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      console.log(values);
      const start = this.convertTo24HourFormat(values.start);
      const end = this.convertTo24HourFormat(values.end);
      console.log(start);
      console.log(end);
      this.scheduleForm.controls['startTime'].setValue(start);
      this.scheduleForm.controls['endTime'].setValue(end);
    }
  }

  convertTo24HourFormat(time: string): string {
    const [timeString, period] = time.split(' ');
    const [hours, minutes] = timeString.split(':').map(Number);
    let convertedHours = hours;
    if (period === 'PM' && hours !== 12) {
      convertedHours += 12; // Convert PM hours
    } else if (period === 'AM' && hours === 12) {
      convertedHours = 0; // Convert 12 AM to 0 hours
    }
    return `${this.padZero(convertedHours)}:${this.padZero(minutes)}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    if (this.scheduleForm.valid) {
      this.dialogRef.close({ event: 'success', data: this.scheduleForm.getRawValue() });
    }
  }

  get f() {
    return this.scheduleForm.controls;
  }

}
