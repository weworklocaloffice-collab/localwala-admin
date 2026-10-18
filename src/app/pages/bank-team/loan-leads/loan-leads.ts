import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

const ACTIONABLE = ['APPLICATION_STARTED', 'DOCUMENTS_PENDING', 'UNDER_BANK_REVIEW'];

/**
 * Loan leads — new applications needing bank action (plan §13.2).
 * Client-side filter over GET /applications: the bank's queue is small
 * (≤50 rows from the API) and the actionable set is a status subset,
 * so no new backend endpoint.
 */
@Component({
  selector: 'app-bank-loan-leads',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './loan-leads.html',
})
export class LoanLeads {
  isLoaded: boolean = false;
  list: any[] = [];
  displayedColumn: string[] = ['lead', 'amount', 'status', 'action'];

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        const all = Array.isArray(response) ? response : [];
        this.list = all.filter((a: any) => ACTIONABLE.includes(a.status));
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
