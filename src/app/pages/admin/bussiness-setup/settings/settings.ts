import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { BusinessSettings } from "../business-settings/business-settings";
import { OrderSettings } from "../order-settings/order-settings";
import { RestaurantSettings } from "../restaurant-settings/restaurant-settings";
import { DriverSettings } from "../driver-settings/driver-settings";
import { UserSettings } from "../user-settings/user-settings";
import { WaiterSettings } from "../waiter-settings/waiter-settings";
import { KitchenOwnerSettings } from "../kitchen-owner-settings/kitchen-owner-settings";
import { DiningSettings } from "../dining-settings/dining-settings";
import { Languages } from "../languages/languages";
import { DisbursementSettings } from "../disbursement-settings/disbursement-settings";
import { UserAvatarList } from "../user-avatar-list/user-avatar-list";
import { SocialSignin } from "../social-signin/social-signin";
import { MediaStorageSettings } from "../media-storage-settings/media-storage-settings";
import { DairySettings } from "../dairy-settings/dairy-settings";

@Component({
  selector: 'app-settings',
  imports: [MatNativeDateModule, CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, BusinessSettings, OrderSettings, RestaurantSettings, DriverSettings, UserSettings, WaiterSettings, KitchenOwnerSettings, DiningSettings, Languages, DisbursementSettings, UserAvatarList, SocialSignin, MediaStorageSettings, DairySettings],
  templateUrl: './settings.html',
})
export class Settings {
  tabIndex: number = 0;

  constructor(public util: UtilService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }
}
