import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-generate-table-qr',
  imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule],
  templateUrl: './dialog-generate-table-qr.html',
})
export class DialogGenerateTableQr {

  action: string = 'create';
  tableForm = new FormGroup({
    restaurant: new FormControl('', [Validators.required]),
    tableNumber: new FormControl('', [Validators.required]),
    capacity: new FormControl('', [Validators.required]),
  });
  isSubmit: boolean = false;
  id: string = '';
  haveSubmitClicked: boolean = false;

  constructor(
    public util: UtilService,
    public api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogGenerateTableQr>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    this.tableForm.controls['restaurant'].setValue(this.util.getItem('_vendorId'));
    if (this.data && this.data.action == 'edit') {
      this.action = this.data.action;
      const values = this.data.values;
      this.id = values.id;
      this.tableForm.controls['tableNumber'].setValue(values && values.tableNumber ? values.tableNumber : '');
      this.tableForm.controls['capacity'].setValue(values && values.capacity ? values.capacity : '');
    }
  }

  onSubmit() {
    this.haveSubmitClicked = true;
    console.log(this.tableForm);
    if (this.tableForm.valid) {
      if (this.action == 'create') {
        this.saveTable();
      } else {
        this.updateTable();
      }
    }
  }

  saveTable() {
    this.isSubmit = true;
    this.api.post_private('v1/vendor_web/restaurant_table/save', this.tableForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_table_added');
        this.dialogRef.close({ event: 'add', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  updateTable() {
    this.isSubmit = true;
    this.api.patch_private('v1/vendor_web/restaurant_table/update/' + this.id, this.tableForm.value).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSubmit = false
        this.util.onSuccess('ts_table_updated');
        this.dialogRef.close({ event: 'update', data: response });
      }, error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  get f() {
    return this.tableForm.controls;
  }

}
