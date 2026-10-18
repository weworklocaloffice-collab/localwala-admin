import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SelectMediaDialog } from 'src/app/pages/admin/media/select-media-dialog/select-media-dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-approve-withdrawal-request-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './approve-withdrawal-request-dialog.html',
})
export class ApproveWithdrawalRequestDialog {

  id: string = '';
  balance: number = 0;
  amount: number = 0;
  acceptForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    approvedNotes: new FormControl('', [Validators.required]),
    proof: new FormControl(''),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ApproveWithdrawalRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id !== null && this.data.id != '') {
      this.id = this.data.id;
      this.balance = this.data.balance;
      this.amount = this.data.amount;
      this.acceptForm.controls['id'].setValue(this.data.id);
      console.log(`Request Id --> ${this.id}`);
    }
  }

  get f() {
    return this.acceptForm.controls;
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.acceptForm.valid) {
      console.log(this.acceptForm.value);
      this.isSubmit = true;
      this.api.post_private('v1/admin/withdrawalRequest/approve', this.acceptForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response && response.success == true) {
            this.isSubmit = false
            this.util.onSuccess('ts_declined');
            this.dialogRef.close({ event: 'true' });
          }
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  onImagePicker() {
    console.log('on image picker');
    const dialogRef = this.dialog.open(SelectMediaDialog, {
      data: { value: this.acceptForm.controls['proof'].value },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      height: "calc(100% - 30px)",
      width: "calc(100% - 30px)",
      maxWidth: "100%",
      maxHeight: "100%",
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result && result.event && result.event == 'select' && result.data && result.data != '') {
        this.acceptForm.controls['proof'].setValue(result.data);
      }
    });
  }

}
