import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-delivery-time-picker',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-delivery-time-picker.html',
})
export class DialogCityzenDeliveryTimePicker {

  deliveryTimeForm = new FormGroup({
    min: new FormControl('', [Validators.required]),
    max: new FormControl('', [Validators.required]),
    type: new FormControl('min', [Validators.required]),
  });
  isSubmit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogCityzenDeliveryTimePicker>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public util: UtilService
  ) {
    console.log(data);
    if (data && data.value && data.value != '') {
      const splitString = data.value.split(' ');
      console.log(splitString);
      if (splitString && splitString instanceof Array && splitString.length == 4) {
        this.deliveryTimeForm.controls['min'].setValue(splitString[0]);
        this.deliveryTimeForm.controls['max'].setValue(splitString[2]);
        this.deliveryTimeForm.controls['type'].setValue(splitString[3]);
      }
    }
  }

  onSubmit() {
    console.log(this.deliveryTimeForm);
    this.dialogRef.close({ event: 'ok', data: this.deliveryTimeForm.value });
  }

  get f() {
    return this.deliveryTimeForm.controls;
  }

}
