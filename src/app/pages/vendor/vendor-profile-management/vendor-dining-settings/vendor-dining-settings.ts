import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { VendorDiningMenuPhotos } from "./vendor-dining-menu-photos/vendor-dining-menu-photos";
import { DiningSchedule } from "./dining-schedule/dining-schedule";
import { DiningGuestAvailability } from "./dining-guest-availability/dining-guest-availability";

@Component({
  selector: 'app-vendor-dining-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, VendorDiningMenuPhotos, DiningSchedule, DiningGuestAvailability],
  templateUrl: './vendor-dining-settings.html',
})
export class VendorDiningSettings {

  tabIndex: number = 0;

  constructor(public util: UtilService) {
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
