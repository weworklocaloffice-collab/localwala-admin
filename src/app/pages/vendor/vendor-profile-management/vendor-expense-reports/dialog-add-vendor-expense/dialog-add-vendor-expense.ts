import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-add-vendor-expense',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-add-vendor-expense.html',
})
export class DialogAddVendorExpense {

  expenseForm = new FormGroup({
    amount: new FormControl('', [Validators.required]),
    restaurant: new FormControl('', [Validators.required]),
    expenseType: new FormControl('other', [Validators.required]),
  });
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogAddVendorExpense>,
  ) {
    this.expenseForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
  }

  get f() {
    return this.expenseForm.controls;
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log('submit', this.expenseForm.getRawValue());
    if (this.expenseForm.valid) {
      this.isSubmit = true;
      this.api.post_private('v1/vendor_web/expense/save/', this.expenseForm.getRawValue()).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          this.util.onSuccess('ts_expense_added');
          this.dialogRef.close({ event: 'add', data: response });
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

}
