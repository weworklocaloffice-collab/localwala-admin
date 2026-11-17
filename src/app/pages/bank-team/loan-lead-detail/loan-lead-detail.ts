import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Loan lead detail — one loan lead with its applications, offers and
 * documents at this bank (plan §13). Assembled from existing endpoints.
 */
@Component({
  selector: 'app-bank-loan-lead-detail',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './loan-lead-detail.html',
})
export class LoanLeadDetail implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  lead: any = null;
  apps: any[] = [];
  id: string = '';
  sub: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  load() {
    this.isLoaded = false;
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        const all = Array.isArray(response) ? response : [];
        const mine = all.filter((a: any) => String(a.loanRequest || a.loan_request || '') === String(this.id));
        this.apps = mine;
        const first = mine[0];
        this.lead = (first && first.loanRequest && typeof first.loanRequest === 'object' && first.loanRequest._id
          ? first.loanRequest
          : { _id: this.id });
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  rowId(row: any): string {
    return row?._id || row?.id || '';
  }
}
