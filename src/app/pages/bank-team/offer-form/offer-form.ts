import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Offer form — deep-linkable offer creation (plan §13.2).
 * Same POST as DialogOfferCreate; `?application=<id>` preselects.
 * The offers list keeps the dialog for quick entry — this page is
 * for review-then-create from an application.
 */
@Component({
  selector: 'app-bank-offer-form',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './offer-form.html',
})
export class OfferForm implements OnInit, OnDestroy {
  applications: any[] = [];
  selectedApplication: any = null;
  loanAmount: number | null = null;
  tenureMonths: number | null = null;
  interestRate: number | null = null;
  processingFee: number | null = 0;
  otherTerms: string = '';
  isSaving: boolean = false;
  sub: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  loadApplications() {
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        this.applications = Array.isArray(response) ? response : [];
        const pre = this.route.snapshot.queryParamMap.get('application');
        if (pre) {
          this.selectedApplication = this.applications.find((a: any) => this.rowId(a) === String(pre)) || null;
          this.onAppChange();
        }
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  /** The row id. The API returns `_id` on the hydrated rows. */
  rowId(row: any): string {
    return row?._id || row?.id || '';
  }

  onAppChange() {
    if (!this.selectedApplication) {
      this.loanAmount = null;
      this.tenureMonths = null;
      this.interestRate = null;
      return;
    }
    // The default offer amount is the amount the customer asked for -
    // the loan application has no `loanAmount` field, so the old default
    // was always undefined and the amount stayed null with the Create
    // button disabled.
    if (this.loanAmount === null && this.selectedApplication.requestedAmount !== undefined) {
      this.loanAmount = this.selectedApplication.requestedAmount;
    }
  }

  onSubmit() {
    if (!this.selectedApplication || this.loanAmount === null) return;
    this.isSaving = true;
    this.api
      .post_private('v1/realestate/bank/offers', {
        loanApplication: this.rowId(this.selectedApplication),
        loanAmount: this.loanAmount,
        tenureMonths: this.tenureMonths,
        interestRate: this.interestRate,
        processingFee: this.processingFee,
        otherTerms: this.otherTerms,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.util.onSuccess('ts_created');
          this.router.navigate(['/bank-team/u/offers']);
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}
