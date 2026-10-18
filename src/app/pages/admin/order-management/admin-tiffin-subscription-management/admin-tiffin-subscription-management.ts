import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AdminTiffinSubscriptionPackageList } from "./admin-tiffin-subscription-package-list/admin-tiffin-subscription-package-list";
import { AdminTiffinSubscriptionCancellationReasons } from "./admin-tiffin-subscription-cancellation-reasons/admin-tiffin-subscription-cancellation-reasons";

@Component({
  selector: 'app-admin-tiffin-subscription-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AdminTiffinSubscriptionPackageList, AdminTiffinSubscriptionCancellationReasons],
  templateUrl: './admin-tiffin-subscription-management.html',
})
export class AdminTiffinSubscriptionManagement {

  tabIndex: number = 0;

  constructor(
    public util: UtilService
  ) {

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
