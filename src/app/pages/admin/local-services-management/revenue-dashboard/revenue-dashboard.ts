import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-ls-revenue-dashboard',
  imports: [CommonModule, MaterialModule],
  templateUrl: './revenue-dashboard.html',
})
export class RevenueDashboard {
  isLoaded: boolean = false;
  summary: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getSummary();
  }

  getSummary() {
    this.isLoaded = false;
    this.api.get_private('v1/local-services/admin/revenue/summary').subscribe({
      next: (response: any) => {
        this.summary = response;
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
