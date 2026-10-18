import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-dining-guest-availability',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dining-guest-availability.html',
})
export class DiningGuestAvailability {

  guestCount: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
  guestAvailable: number[] = [];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getInfo();
  }

  getInfo() {
    const spinnerRef = this.util.start('ts_fetching');
    this.api.get_private('v1/vendor_web/restaurant_extra_detail/getGuestAvailability/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.result && response.result.guestAvailability) {
          this.guestAvailable = response.result.guestAvailability;
          console.log(this.guestAvailable);
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onAddOrRemove(item: number) {
    console.log(item);
    if (this.guestAvailable.includes(item)) {
      this.guestAvailable = this.guestAvailable.filter((x) => x != item);
    } else {
      this.guestAvailable.push(item);
    }
  }

  onSubmit() {
    console.log('on submit', this.guestAvailable);
    this.guestAvailable = this.guestAvailable.sort((a, b) => a - b);
    console.log('to send -->', this.guestAvailable.join(','));
    const spinnerRef = this.util.start('ts_updating');
    this.api.post_private('v1/vendor_web/restaurant_extra_detail/saveGuestAvailability/' + this.util.getItem('_vendorId'), { 'availability': this.guestAvailable.join(',') }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        this.util.onSuccess('ts_updated');
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'vendor');
      }
    });
  }

}
