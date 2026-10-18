import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Dialog for creating or editing a bank commission agreement.
 *
 * CREATE mode (`data` undefined): picks a bank, rate, basis and window.
 * EDIT mode: only DRAFT rows are editable — `bank` is locked and ACTIVE
 * rows must take a new version instead (server enforces both).
 */
@Component({
  selector: 'app-dialog-bank-agreement',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-bank-agreement.html',
})
export class DialogBankAgreement {
  isEdit: boolean;
  isSaving: boolean = false;
  banksLoading: boolean = false;
  banks: any[] = [];

  commissionTypes = ['DISBURSED', 'SANCTIONED'];
  bases = ['LOAN_DISBURSED', 'SANCTION_AMOUNT'];

  form: any = {
    bank: '',
    commissionType: 'DISBURSED',
    rate: null,
    calculationBasis: 'LOAN_DISBURSED',
    minLoan: null,
    maxLoan: null,
    effectiveFrom: '',
    effectiveTo: '',
    payoutCycle: '',
    tdsPercentage: null,
    offerVisibleToCustomer: true,
  };

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogBankAgreement>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.isEdit = !!data;
    if (this.isEdit) {
      this.form = {
        bank: typeof data.bank === 'object' ? data.bank._id || data.bank.id : data.bank,
        commissionType: data.commissionType || 'DISBURSED',
        rate: data.rate,
        calculationBasis: data.calculationBasis || 'LOAN_DISBURSED',
        minLoan: data.minLoan ?? null,
        maxLoan: data.maxLoan ?? null,
        effectiveFrom: (data.effectiveFrom || '').slice(0, 10),
        effectiveTo: (data.effectiveTo || '').slice(0, 10),
        payoutCycle: data.settlementTerms?.payoutCycle || '',
        tdsPercentage: data.settlementTerms?.tdsPercentage ?? null,
        offerVisibleToCustomer: data.offerVisibleToCustomer !== false,
      };
    } else {
      this.loadBanks();
    }
  }

  loadBanks() {
    this.banksLoading = true;
    this.api.get_private('v1/realestate/admin/banks?limit=100').subscribe({
      next: (response: any) => {
        const results = (response && response.results) || [];
        this.banks = Array.isArray(results) ? results : [];
        this.banksLoading = false;
      },
      error: () => {
        this.banksLoading = false;
      },
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  get canSubmit(): boolean {
    if (this.isSaving || this.form.rate == null) return false;
    if (!this.isEdit) {
      return !!this.form.bank && !!this.form.effectiveFrom;
    }
    return true;
  }

  onSubmit() {
    if (!this.canSubmit) return;
    this.isSaving = true;
    const settlementTerms: any = {};
    if (this.form.payoutCycle) settlementTerms.payoutCycle = this.form.payoutCycle;
    if (this.form.tdsPercentage != null) settlementTerms.tdsPercentage = this.form.tdsPercentage;
    let obs: any;
    if (this.isEdit) {
      obs = this.api.patch_private(`v1/realestate/admin/bank-agreements/${this.data._id}`, {
        commissionType: this.form.commissionType,
        rate: this.form.rate,
        calculationBasis: this.form.calculationBasis,
        ...(this.form.minLoan != null ? { minLoan: this.form.minLoan } : {}),
        ...(this.form.maxLoan != null ? { maxLoan: this.form.maxLoan } : {}),
        ...(this.form.effectiveFrom ? { effectiveFrom: this.form.effectiveFrom } : {}),
        ...(this.form.effectiveTo ? { effectiveTo: this.form.effectiveTo } : { effectiveTo: null }),
        settlementTerms,
        offerVisibleToCustomer: this.form.offerVisibleToCustomer !== false,
      });
    } else {
      obs = this.api.post_private('v1/realestate/admin/bank-agreements', {
        bank: this.form.bank,
        commissionType: this.form.commissionType,
        rate: this.form.rate,
        calculationBasis: this.form.calculationBasis,
        ...(this.form.minLoan != null ? { minLoan: this.form.minLoan } : {}),
        ...(this.form.maxLoan != null ? { maxLoan: this.form.maxLoan } : {}),
        effectiveFrom: this.form.effectiveFrom,
        ...(this.form.effectiveTo ? { effectiveTo: this.form.effectiveTo } : {}),
        ...(Object.keys(settlementTerms).length ? { settlementTerms } : {}),
        offerVisibleToCustomer: this.form.offerVisibleToCustomer !== false,
      });
    }
    obs.subscribe({
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
