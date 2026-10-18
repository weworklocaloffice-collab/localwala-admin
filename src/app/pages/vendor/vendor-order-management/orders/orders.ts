import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { VendorNewOrderList } from "./vendor-new-order-list/vendor-new-order-list";
import { VendorPreparingOrderList } from "./vendor-preparing-order-list/vendor-preparing-order-list";
import { VendorReadyOrderList } from "./vendor-ready-order-list/vendor-ready-order-list";
import { VendorHandoverOrderList } from "./vendor-handover-order-list/vendor-handover-order-list";
import { VendorOngoingOrderList } from "./vendor-ongoing-order-list/vendor-ongoing-order-list";
import { VendorDeliveredOrderList } from "./vendor-delivered-order-list/vendor-delivered-order-list";
import { VendorRejectedOrderList } from "./vendor-rejected-order-list/vendor-rejected-order-list";

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    VendorNewOrderList,
    VendorPreparingOrderList,
    VendorReadyOrderList,
    VendorHandoverOrderList,
    VendorOngoingOrderList,
    VendorDeliveredOrderList,
    VendorRejectedOrderList,
  ],
  templateUrl: './orders.html',
})
export class Orders {

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
