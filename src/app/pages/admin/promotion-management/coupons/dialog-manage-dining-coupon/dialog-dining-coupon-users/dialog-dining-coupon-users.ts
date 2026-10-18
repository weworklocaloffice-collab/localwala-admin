import { Component, Inject } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime } from 'luxon';
import { UserSearchListInterface } from 'src/app/interfaces/user.search.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-dining-coupon-users',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dialog-dining-coupon-users.html',
})
export class DialogDiningCouponUsers {

  listOfUsers = new MatTableDataSource<UserSearchListInterface>([]);
  displayedColumn = ['id', 'name', 'email', 'select'];
  isLoaded: boolean = true;
  savedItems: UserSearchListInterface[] = [];
  savedIds: string[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogDiningCouponUsers>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);

    if (this.data && this.data.value && this.data.value.length > 0) {
      this.savedItems = this.data.value;
      this.savedItems.forEach((element) => {
        this.savedIds.push(element.id);
      });
      console.log('------------111', this.savedItems);
      console.log('=============22', this.savedIds);
    }
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
      this.savedItems.push(item);
      this.savedIds.push(item.id);
    } else {
      this.savedItems = this.savedItems.filter((x) => x.id != item.id);
      this.savedIds = this.savedIds.filter((x) => x != item.id);
    }
    console.log('saved item -----> ', this.savedItems);
  }

  onClose() {
    this.dialogRef.close({ 'saved': this.savedItems });
  }

  getDate(date: string) {
    return DateTime.fromISO(date).setLocale(this.util.appLocaleName()).toFormat('dd LLL yyyy');
  }

}
