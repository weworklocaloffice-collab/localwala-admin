import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-add-wallet-fund',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-add-wallet-fund.html',
})
export class DialogAddWalletFund {

  fundForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    userId: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    referral: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;
  customerName: string = '';
  customerImage: string = '';
  customerWalletBalance: number = 0;
  customerEmail: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogAddWalletFund>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.values && this.data.values.id && this.data.values.wallets.id) {
      const value = this.data.values;
      this.fundForm.controls['id'].setValue(value.wallets.id);
      this.fundForm.controls['userId'].setValue(value.id);
      this.customerName = `${value.firstName} ${value.lastName}`;
      this.customerImage = value.image;
      this.customerEmail = value.contactEmail;
      this.customerWalletBalance = value.wallets.balance;

    }
  }

  get f() {
    return this.fundForm.controls;
  }

  onSubmit() {
    console.log(this.fundForm);
    this.isFormSubmit = true;
    if (this.fundForm.valid) {
      this.isSubmit = true;
      this.api.post_private('v1/admin/customer/wallet/addFund', this.fundForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          this.util.onSuccess('ts_fund_added');
          this.dialogRef.close({ event: 'add', data: response });
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

}
