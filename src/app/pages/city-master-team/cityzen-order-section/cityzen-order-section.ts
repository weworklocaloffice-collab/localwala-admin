import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenOrderList } from "./cityzen-order-list/cityzen-order-list";

@Component({
  selector: 'app-cityzen-order-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenOrderList],
  templateUrl: './cityzen-order-section.html',
})
export class CityzenOrderSection {

  tabIndex: number = 0;
  allOrders: number = 0;
  freshOrders: number = 0;
  accepted: number = 0;
  preparingOrders: number = 0;
  readyOrder: number = 0;
  handoverOrder: number = 0;
  ongoingOrder: number = 0;
  deliveredOrder: number = 0;
  cancelledOrder: number = 0;
  rejectedOrder: number = 0;
  refundedOrder: number = 0;
  partiallyOrder: number = 0;
  pendingOrder: number = 0;
  scheduleOrder: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getCounts();
  }

  getCounts() {
    this.api.get_private('v1/cityzen/orders_count/' + this.util.getItem('_uid')).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.success && response.success == true) {
          this.allOrders = response.all;
          this.freshOrders = response.fresh;
          this.accepted = response.accepted;
          this.preparingOrders = response.preparing;
          this.readyOrder = response.ready;
          this.handoverOrder = response.handover;
          this.ongoingOrder = response.ongoing;
          this.deliveredOrder = response.delivered;
          this.cancelledOrder = response.cancelled;
          this.rejectedOrder = response.rejected;
          this.refundedOrder = response.refunded;
          this.partiallyOrder = response.partially;
          this.pendingOrder = response.pending;
          this.scheduleOrder = response.schedule;
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
