import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UtilService } from 'src/app/services/util-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReportIssueRestaurantList } from "./report-issue-restaurant-list/report-issue-restaurant-list";
import { ReportIssueRestaurantReason } from "./report-issue-restaurant-reason/report-issue-restaurant-reason";

@Component({
  selector: 'app-report-issue-restaurant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, ReportIssueRestaurantList, ReportIssueRestaurantReason],
  templateUrl: './report-issue-restaurant.html',
})
export class ReportIssueRestaurant {

  tabIndex: number = 0;

  constructor(public util: UtilService) { }


  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.tabIndex = tabChangeEvent.index;
  }

}
