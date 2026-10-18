import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-bank-dashboard',
  imports: [CommonModule, MaterialModule],
  templateUrl: './bank-dashboard.html',
})
export class Dashboard {
  isLoaded: boolean = false;
  applications: any[] = [];
  offers: any[] = [];
  totalApplications: number = 0;
  totalOffers: number = 0;
  pendingReview: number = 0;

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.loadApplications();
    this.loadOffers();
    this.computeStats();
  }

  loadApplications() {
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        this.applications = Array.isArray(response) ? response : [];
        this.computeStats();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  loadOffers() {
    this.api.get_private('v1/realestate/bank/offers').subscribe({
      next: (response: any) => {
        this.offers = Array.isArray(response) ? response : [];
        this.computeStats();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  computeStats() {
    this.totalApplications = this.applications.length;
    this.totalOffers = this.offers.length;
    this.pendingReview = this.applications.filter(a => a.status === 'UNDER_BANK_REVIEW').length;
  }
}