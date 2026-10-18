import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SystemDriverList } from "./system-driver-list/system-driver-list";
import { VendorDriverList } from "./vendor-driver-list/vendor-driver-list";

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, SystemDriverList, VendorDriverList],
  templateUrl: './drivers.html',
})
export class Drivers {

  tabIndex: number = 0;
  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
