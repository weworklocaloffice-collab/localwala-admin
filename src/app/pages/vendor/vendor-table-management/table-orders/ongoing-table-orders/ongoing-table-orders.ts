import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendorOngoingTableOrderInterface } from 'src/app/interfaces/vendor.ongoing.table.order.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-ongoing-table-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './ongoing-table-orders.html',
})
export class OngoingTableOrders {

  isLoaded: boolean = false;
  tablesOrders: VendorOngoingTableOrderInterface[] = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    public router: Router
  ) {
    this.getList();
  }

  getList() {
    console.log('get order list');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/table_order/ongoing/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.tables) {
          this.tablesOrders = response.tables;
        }
        console.log(this.tablesOrders);
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onOrderDetail(order: VendorOngoingTableOrderInterface) {
    console.log(order);
    if (order.occupied) {
      this.router.navigate(['vendor/table-management/ongoing-table-order-detail', order.tableNumber, order.id]);
    } else {
      this.util.onError('ts_no_orders', '');
    }
  }

}
