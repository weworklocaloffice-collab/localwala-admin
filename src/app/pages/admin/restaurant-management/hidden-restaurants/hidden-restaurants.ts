import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HiddenRestaurantList } from "./hidden-restaurant-list/hidden-restaurant-list";
import { HiddenRestaurantReason } from "./hidden-restaurant-reason/hidden-restaurant-reason";

@Component({
  selector: 'app-hidden-restaurants',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, HiddenRestaurantList, HiddenRestaurantReason],
  templateUrl: './hidden-restaurants.html',
})
export class HiddenRestaurants {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }


  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
