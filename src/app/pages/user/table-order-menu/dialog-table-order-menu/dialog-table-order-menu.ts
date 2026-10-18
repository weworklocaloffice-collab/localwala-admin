import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerMenuCategoriesInterface } from 'src/app/interfaces/customer.menu.categories.interface';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-table-order-menu',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-table-order-menu.html',
})
export class DialogTableOrderMenu {

  categories: CustomerMenuCategoriesInterface[] = [];
  constructor(
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogTableOrderMenu>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.data && Array.isArray(this.data.data)) {
      this.categories = this.data.data;
    }
    console.log(this.categories);
  }

  onSelect(id: string) {
    console.log(id);
    this.dialogRef.close({ event: 'select', data: id });
  }

}
