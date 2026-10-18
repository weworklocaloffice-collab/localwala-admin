import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

export const RULE_TYPES: string[] = [
  'PROPERTY_SALE',
  'BANK_LOAN',
  'CUSTOMER_REFERRAL',
  'EXECUTIVE',
  'HOLD_FEE',
  'LISTING_PACKAGE',
  'PROMOTION',
];

export const RULE_BASES: string[] = [
  'SALE_VALUE',
  'LOCALWALA_COMMISSION',
  'LOAN_DISBURSED',
  'SANCTION_AMOUNT',
  'FIXED_AMOUNT',
  'HOLD_PRINCIPAL',
  'FLAT',
];

@Component({
  selector: 'app-dialog-commission-rule',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dialog-commission-rule.html',
})
export class DialogCommissionRule {
  name: string = '';
  type: string = 'PROPERTY_SALE';
  rate: number | null = null;
  basis: string = 'SALE_VALUE';
  slabFrom: number | null = 0;
  slabTo: number | null = null;
  types = RULE_TYPES;
  bases = RULE_BASES;
  isSaving: boolean = false;
  isEdit: boolean = false;

  constructor(
    public api: ApiService,
    public util: UtilService,
    private dialogRef: MatDialogRef<DialogCommissionRule>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    // EDIT mode: only DRAFT rows arrive here (the list gates it).
    // Type + slab identity are locked — a rate change on an ACTIVE row
    // is a new version, never an edit (BR-15, F-8).
    this.isEdit = !!data;
    if (this.isEdit) {
      this.name = data.name || '';
      this.type = data.type || 'PROPERTY_SALE';
      this.rate = data.rate ?? null;
      this.basis = data.calculationBasis || 'SALE_VALUE';
      this.slabFrom = data.slabFrom ?? 0;
      this.slabTo = data.slabTo ?? null;
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.name || this.rate === null) {
      return;
    }
    this.isSaving = true;
    const obs = this.isEdit
      ? this.api.patch_private(`v1/realestate/admin/commission-rules/${this.data._id}`, {
          name: this.name,
          rate: this.rate,
          calculationBasis: this.basis,
          slabFrom: this.slabFrom || 0,
          slabTo: this.slabTo,
        })
      : this.api.post_private('v1/realestate/admin/commission-rules', {
          name: this.name,
          type: this.type,
          rate: this.rate,
          calculationBasis: this.basis,
          slabFrom: this.slabFrom || 0,
          slabTo: this.slabTo,
          effectiveFrom: new Date().toISOString(),
        });
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
