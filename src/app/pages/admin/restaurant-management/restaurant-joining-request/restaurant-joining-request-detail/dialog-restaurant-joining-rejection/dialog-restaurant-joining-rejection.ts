import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-restaurant-joining-rejection',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-restaurant-joining-rejection.html',
})
export class DialogRestaurantJoiningRejection {

  id: string = '';
  rejectionForm = new FormGroup({
    rejection: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogRestaurantJoiningRejection>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id !== null && this.data.id != '') {
      this.id = this.data.id;
      console.log(`Request Id --> ${this.id}`);
    }
  }

  get f() {
    return this.rejectionForm.controls;
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.rejectionForm.valid) {
      console.log(this.rejectionForm.value);
      this.isSubmit = true;
      this.api.patch_private('v1/admin/restaurant_request/reject/' + this.id, this.rejectionForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.success == true) {
            this.isSubmit = false
            this.util.onSuccess('ts_rejected');
            this.dialogRef.close({ event: 'true' });
          }
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
