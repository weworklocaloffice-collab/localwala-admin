import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-cityzen-decline-withdrawal-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-cityzen-decline-withdrawal-request.html',
})
export class DialogCityzenDeclineWithdrawalRequest {

  id: string = '';
  balance: number = 0;
  amount: number = 0;
  rejectForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    reason: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogCityzenDeclineWithdrawalRequest>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id !== null && this.data.id != '') {
      this.id = this.data.id;
      this.balance = this.data.balance;
      this.amount = this.data.amount;
      this.rejectForm.controls['id'].setValue(this.data.id);
      console.log(`Request Id --> ${this.id}`);
    }
  }

  get f() {
    return this.rejectForm.controls;
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.rejectForm.valid) {
      console.log(this.rejectForm.value);
      this.isSubmit = true;
      this.api.post_private('v1/cityzen/decline_withdrawal_request', this.rejectForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.success == true) {
            this.isSubmit = false
            this.util.onSuccess('ts_declined');
            this.dialogRef.close({ event: 'true' });
          }
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'cityzen');
        }
      });
    }
  }

}
