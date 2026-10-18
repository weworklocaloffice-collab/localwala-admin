import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenDiningBookingList } from "./cityzen-dining-booking-list/cityzen-dining-booking-list";

@Component({
  selector: 'app-cityzen-dining-booking-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenDiningBookingList],
  templateUrl: './cityzen-dining-booking-section.html',
})
export class CityzenDiningBookingSection {

  tabIndex: number = 0;
  acceptedBooking: number = 0;
  allBooking: number = 0;
  cancelledBooking: number = 0;
  completedBooking: number = 0;
  freshBooking: number = 0;
  partiallyBooking: number = 0;
  pendingBooking: number = 0;
  refundedBooking: number = 0;
  rejectedBooking: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getCount();
  }

  getCount() {
    this.api.get_private('v1/cityzen/dining_booking_count/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success && response.success == true) {
          this.acceptedBooking = response.accepted;
          this.allBooking = response.all;
          this.cancelledBooking = response.cancelled;
          this.completedBooking = response.completed;
          this.freshBooking = response.fresh;
          this.partiallyBooking = response.partially;
          this.pendingBooking = response.pending;
          this.refundedBooking = response.refunded;
          this.rejectedBooking = response.rejected;
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.handleError(error, 'cityzen');
      }
    });
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
