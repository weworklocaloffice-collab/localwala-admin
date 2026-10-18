import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-call-number-dialog',
  imports: [MatNativeDateModule, MaterialModule, NgIcon],
  templateUrl: './call-number-dialog.html',
})
export class CallNumberDialog {
  email: string = '';
  image: string = '';
  mobile: string = '';
  fullMobile: string = '';
  name: string = '';
  role: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    public dialogRef: MatDialogRef<CallNumberDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    const formatMobileNumber = (number: string): string => {
      const cleanNumber = number.replace(/\D/g, '');
      return cleanNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    };
    this.email = this.data.email;
    this.image = this.data.image;
    this.mobile = `+${this.data.countryCode}-${formatMobileNumber(this.data.mobile)}`;
    this.fullMobile = `+${this.data.countryCode}${this.data.mobile}`;
    this.name = this.data.name;
    if (this.data.role == 'user') {
      this.role = this.util.appTranslate('user');
    } else if (this.data.role == 'driver') {
      this.role = this.util.appTranslate('system_deliveryman');
    } else if (this.data.role == 'vendor') {
      this.role = this.util.appTranslate('restaurant');
    } else if (this.data.role == 'vendorDriver') {
      this.role = this.util.appTranslate('vendor_deliveryman');
    } else if (this.data.role == 'vendorOutlet') {
      this.role = this.util.appTranslate('restaurant_outlet');
    } else if (this.data.role == 'cityMaster') {
      this.role = this.util.appTranslate('cityzen_team');
    } else if (this.data.role == 'supportTeam') {
      this.role = this.util.appTranslate('support_team');
    } else if (this.data.role == 'guest') {
      this.role = this.util.appTranslate('dd_guest');
    } else if (this.data.role == 'waiter') {
      this.role = this.util.appTranslate('waiter');
    } else if (this.data.role == 'accountant') {
      this.role = this.util.appTranslate('accountant_team');
    } else if (this.data.role == 'kitchen') {
      this.role = this.util.appTranslate('kitchen_owner');
    }
    console.log(`${this.name} ${this.email} ${this.mobile} ${this.role} ${this.image}`);
  }
}
