import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenSystemDeliverymanList } from "./cityzen-system-deliveryman-list/cityzen-system-deliveryman-list";
import { CityzenVendorDeliverymanList } from "./cityzen-vendor-deliveryman-list/cityzen-vendor-deliveryman-list";

@Component({
  selector: 'app-cityzen-deliveryman-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenSystemDeliverymanList, CityzenVendorDeliverymanList],
  templateUrl: './cityzen-deliveryman-section.html',
})
export class CityzenDeliverymanSection {

  tabIndex: number = 0;

  constructor(public util: UtilService, public api: ApiService) {
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
