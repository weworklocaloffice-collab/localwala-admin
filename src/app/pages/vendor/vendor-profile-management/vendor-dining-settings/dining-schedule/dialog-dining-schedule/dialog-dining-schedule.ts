import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-dining-schedule',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-dining-schedule.html',
})
export class DialogDiningSchedule {

  action: string = 'create';
  scheduleForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogDiningSchedule>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public util: UtilService
  ) {
    console.log(this.data);
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      console.log(values);
      const time = this.convertTo24HourFormat(values.time);
      console.log(time);
      this.scheduleForm.controls['type'].setValue(values.type);
      this.scheduleForm.controls['time'].setValue(time);
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
