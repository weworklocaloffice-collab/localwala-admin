import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { VendorDeliverymanListInterface } from 'src/app/interfaces/vendor.deliveryman.list.interface';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-select-deliveryman',
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-select-deliveryman.html',
})
export class DialogSelectDeliveryman {

  listOfDeliveryman = new MatTableDataSource<VendorDeliverymanListInterface>([]);
  displayedColumn = ['id', 'name', 'select'];
  findMode: string = '';
  isLoaded: boolean = true;
  selectedDriver: string = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogSelectDeliveryman>,
  ) {
    this.getDeliveryman();
  }

  getDeliveryman() {
    this.isLoaded = false;
    this.api.get_private('v1/vendor_web/drivers/activeDriver/' + this.util.getItem('_vendorId')).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoaded = true;
        if (response && response.success) {
          this.findMode = response.findMode;
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
    this.dialogRef.close({ 'saved': this.selectedDriver });
  }

  checkEvent(event: MatCheckboxChange, item: VendorDeliverymanListInterface) {
    console.log(event, item);
    if (event.checked) {
      this.selectedDriver = item.users.id;
    } else {
      this.selectedDriver = '';
    }
  }

}
