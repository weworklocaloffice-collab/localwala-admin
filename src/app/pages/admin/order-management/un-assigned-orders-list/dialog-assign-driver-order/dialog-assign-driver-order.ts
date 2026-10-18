import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AdminDriverNearRestaurantListInterface } from 'src/app/interfaces/admin.driver.near.restaurant.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dialog-assign-driver-order',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, NgIcon],
  templateUrl: './dialog-assign-driver-order.html',
})
export class DialogAssignDriverOrder {

  drivers = new MatTableDataSource<AdminDriverNearRestaurantListInterface>([]);
  displayedColumn = ['id', 'name', 'handle', 'far', 'contact', 'action'];
  orderId: string = '';
  restaurantId: string = '';
  isLoaded: boolean = false;
  findMode: string = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    public dialogRef: MatDialogRef<DialogAssignDriverOrder>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.value) {
      console.log(this.data.value);
      this.orderId = this.data.value.id;
      this.restaurantId = this.data.value.restaurant;
      this.getDrivers();
    } else {
      this.dialogRef.close();
    }
  }

  getDrivers() {
    console.log(this.orderId);
    console.log(this.restaurantId);
    this.isLoaded = false;
    this.api.get_private('v1/admin/orders/fetchDriverNearToOrder/' + this.orderId + '/' + this.restaurantId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.drivers) {
          this.drivers = response.drivers;
          console.log(this.drivers);
        }
        this.findMode = response.findMode;
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      }
    });
  }

  assignDriver(driver: AdminDriverNearRestaurantListInterface) {
    console.log('asssign', driver);
    const param = {
      id: this.orderId,
      driver: driver.driverInfo.id,
    };
    const spinnerRef = this.util.start();
    this.api.post_private('v1/admin/orders/assignDriverOrderAdmin/', param).subscribe({
      next: (response: any) => {
        console.log(response);
        this.util.stop(spinnerRef);
        if (response && response.success) {
          this.util.onSuccess('ts_assigned_deliveryman_an_order');
        }
      }, error: (error: any) => {
        console.log(error);
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

}
