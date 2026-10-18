import { Component, Inject } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { VendorFindDeliverymanListInterface } from 'src/app/interfaces/vendor.find.deliveryman.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-find-deliveryman',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-find-deliveryman.html',
})
export class DialogFindDeliveryman {

  listOfDeliveryman = new MatTableDataSource<VendorFindDeliverymanListInterface>([]);
  id: string = '';
  displayedColumn = ['id', 'name', 'select'];
  findMode: string = '';
  isLoaded: boolean = true;
  selectedDriver: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogFindDeliveryman>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data && this.data.id) {
      this.id = this.data.id;
      this.getDeliveryman();
    }
  }

  getDeliveryman() {
    console.log('Deliveryman');
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/orders/fetchDriverNearToOrder/' + this.id + '/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success) {
          this.findMode = response.findMode;
          response.drivers.forEach((element: VendorFindDeliverymanListInterface) => {
            let roundedNum = parseFloat(element.distance.toFixed(2));
            element.distance = roundedNum;
          });
          this.listOfDeliveryman = response.drivers;
        }
      }, error: (error: any) => {
        console.log(error);
        this.isLoaded = true;
        this.util.handleError(error, 'vendor');
      }
    });
  }

  onClose() {
    if (this.selectedDriver != '') {
      console.log('submit');
      const param = {
        'id': this.id,
        'driver': this.selectedDriver
      };
      console.log(param);
      const spinnerRef = this.util.start();
      this.api.post_private('v1/vendor_web/orders/assignDriverOrderVendor/', param).subscribe({
        next: (response: any) => {
          console.log(response);
          this.util.stop(spinnerRef);
          if (response && response.success) {
            this.dialogRef.close({ 'saved': this.selectedDriver });
          } else {
            this.util.onError('ts_something_went_wrong', '');
          }
        }, error: (error: any) => {
          console.log(error);
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'vendor');
        }
      });
    }
  }

  checkEvent(event: MatCheckboxChange, item: VendorFindDeliverymanListInterface) {
    console.log(event, item);
    if (event.checked) {
      this.selectedDriver = item.driverInfo.id;
    } else {
      this.selectedDriver = '';
    }
  }

}
