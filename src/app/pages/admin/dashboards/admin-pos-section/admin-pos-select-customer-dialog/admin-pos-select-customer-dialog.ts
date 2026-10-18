import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UserSearchListInterface } from 'src/app/interfaces/user.search.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DateTime } from 'luxon';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-admin-pos-select-customer-dialog',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, NgIcon],
  templateUrl: './admin-pos-select-customer-dialog.html',
})
export class AdminPosSelectCustomerDialog {
  listOfUsers = new MatTableDataSource<UserSearchListInterface>([]);
  displayedColumn = ['id', 'name', 'email', 'select'];
  isLoaded: boolean = true;
  selectedCustomer: string = '';
  customerName: string = '';
  customerMobile: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<AdminPosSelectCustomerDialog>,
  ) {

  }

  onSearchChange(searchValue: any) {
    console.log(searchValue);
    if (searchValue && searchValue.target && searchValue.target.value && searchValue.target.value != '') {
      let value: string = searchValue.target.value;
      if (value.length >= 3) {
        console.log('on search.');
        this.isLoaded = false;
        this.api.get_private('v1/admin/users/search/' + value).subscribe({
          next: (response: any) => {
            this.isLoaded = true;
            console.log(response);
            this.listOfUsers = response.users;
          }, error: (error: any) => {
            console.log(error);
            this.isLoaded = true;
            this.listOfUsers.data = [...[]];
            this.util.handleError(error, 'admin');
          }
        });
      }
    }
  }

  checkEvent(event: MatCheckboxChange, item: UserSearchListInterface) {
    console.log(event);
    console.log(item);
    if (event.checked == true) {
      this.selectedCustomer = item.id;
      this.customerName = `${item.firstName} ${item.lastName}`;
      this.customerMobile = `+${item.countryCode} ${item.contactNumber}`;
    } else {
      this.selectedCustomer = '';
      this.customerMobile = '';
      this.customerName = '';
    }
  }

  onClose() {
    this.dialogRef.close({ 'id': this.selectedCustomer, 'name': this.customerName, 'contact': this.customerMobile });
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }
}
