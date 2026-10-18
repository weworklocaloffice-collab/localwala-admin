import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NewTableBooking } from "./new-table-booking/new-table-booking";
import { AcceptedTableBooking } from "./accepted-table-booking/accepted-table-booking";
import { CompletedTableBooking } from "./completed-table-booking/completed-table-booking";
import { CancelledTableBooking } from "./cancelled-table-booking/cancelled-table-booking";
import { RejectedTableBooking } from "./rejected-table-booking/rejected-table-booking";
import { RefundedTableBooking } from "./refunded-table-booking/refunded-table-booking";
import { PartiallyRefundedTableBooking } from "./partially-refunded-table-booking/partially-refunded-table-booking";

@Component({
  selector: 'app-table-booking',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NewTableBooking,
    AcceptedTableBooking,
    CompletedTableBooking,
    CancelledTableBooking,
    RejectedTableBooking,
    RefundedTableBooking,
    PartiallyRefundedTableBooking,
  ],
  templateUrl: './table-booking.html',
})
export class TableBooking {

  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
