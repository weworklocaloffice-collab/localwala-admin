import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CityzenOrderComplaintList } from "./cityzen-order-complaint-list/cityzen-order-complaint-list";
import { CityzenRestaurantComplaintList } from "./cityzen-restaurant-complaint-list/cityzen-restaurant-complaint-list";

@Component({
  selector: 'app-cityzen-complaints-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CityzenOrderComplaintList, CityzenRestaurantComplaintList],
  templateUrl: './cityzen-complaints-section.html',
})
export class CityzenComplaintsSection {

  tabIndex: number = 0;

  constructor(public util: UtilService) {
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
