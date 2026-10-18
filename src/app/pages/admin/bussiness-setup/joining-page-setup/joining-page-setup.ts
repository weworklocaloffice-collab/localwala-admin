import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RestaurantJoiningSetup } from "./restaurant-joining-setup/restaurant-joining-setup";
import { DeliverymanJoiningSetup } from "./deliveryman-joining-setup/deliveryman-joining-setup";

@Component({
  selector: 'app-joining-page-setup',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, RestaurantJoiningSetup, DeliverymanJoiningSetup],
  templateUrl: './joining-page-setup.html',
})
export class JoiningPageSetup {

  tabIndex: number = 0;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    this.tabIndex = tabChangeEvent.index;
  }

}
