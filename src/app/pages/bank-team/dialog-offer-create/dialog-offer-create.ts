import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-offer-create',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-offer-create.html',
})
export class DialogOfferCreate {
  applications: any[] = [];
  selectedApplication: any = null;
  loanAmount: number | null = null;
  tenureMonths: number | null = null;
  interestRate: number | null = null;
  processingFee: number | null = 0;
  isSaving: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogOfferCreate>,
  ) {}

  onClose() {
    this.dialogRef.close();
  }

  /**
   * Selecting an application defaults the offer amount to what was requested;
   * clearing the selection clears the form. Field-level edits after that are
   * the bank's and are never overwritten.
   */
  onAppChange() {
    if (!this.selectedApplication) {
      this.loanAmount = null;
      this.tenureMonths = null;
      this.interestRate = null;
      return;
    }
    if (this.loanAmount === null && this.selectedApplication.loanAmount !== undefined) {
      this.loanAmount = this.selectedApplication.loanAmount;
    }
  }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.api.get_private('v1/realestate/bank/applications').subscribe({
      next: (response: any) => {
        this.applications = Array.isArray(response) ? response : [];
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmit() {
    if (!this.selectedApplication || this.loanAmount === null) return;
    this.isSaving = true;
    this.api
      .post_private('v1/realestate/bank/offers', {
        loanApplication: this.selectedApplication._id,
        loanAmount: this.loanAmount,
        tenureMonths: this.tenureMonths,
        interestRate: this.interestRate,
        processingFee: this.processingFee,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close({ event: 'created' });
        },
        error: (error: any) => {
          this.isSaving = false;
          this.util.handleError(error, 'admin');
        },
      });
  }
}