import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OngoingTableOrders } from "./ongoing-table-orders/ongoing-table-orders";
import { CompletedTableOrders } from "./completed-table-orders/completed-table-orders";

@Component({
  selector: 'app-table-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, OngoingTableOrders, CompletedTableOrders],
  templateUrl: './table-orders.html',
})
export class TableOrders {

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
