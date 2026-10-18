import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ComplaintsReason } from "./complaints-reason/complaints-reason";
import { RestaurantComplaintsList } from "./restaurant-complaints-list/restaurant-complaints-list";
import { ComplaintsList } from "./complaints-list/complaints-list";

@Component({
  selector: 'app-order-complaint-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, ComplaintsReason, RestaurantComplaintsList, ComplaintsList],
  templateUrl: './order-complaint-request.html',
})
export class OrderComplaintRequest {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }


  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
