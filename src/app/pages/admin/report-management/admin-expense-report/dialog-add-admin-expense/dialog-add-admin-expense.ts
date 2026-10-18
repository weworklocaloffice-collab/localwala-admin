import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dialog-add-admin-expense',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-add-admin-expense.html',
})
export class DialogAddAdminExpense {

  expenseForm = new FormGroup({
    expenseType: new FormControl('other', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  isFormSubmit: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogAddAdminExpense>,
  ) {

  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.expenseForm.valid) {
      this.isSubmit = true;
      this.api.post_private('v1/admin/expense/save', this.expenseForm.value).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isSubmit = false
          this.util.onSuccess('ts_expense_added');
          this.dialogRef.close({ event: 'add', data: response });
        }, error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        }
      });
    }
  }

  get f() {
    return this.expenseForm.controls;
  }

}
