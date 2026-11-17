import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-dialog-rule-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dialog-rule-form.html',
})
export class DialogRuleForm {
  isSubmit: boolean = false;
  haveSubmitClicked: boolean = false;
  parentCategories: any[] = [];
  services: any[] = [];

  ruleForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    revenueModel: new FormControl('COMBINED', [Validators.required]),
    categoryKey: new FormControl(''),
    serviceKey: new FormControl(''),
    payer: new FormControl('customer', [Validators.required]),
    bookingFeeEnabled: new FormControl(true),
    bookingFee: new FormControl(60, [Validators.min(0)]),
    commissionEnabled: new FormControl(true),
    commissionRatePercent: new FormControl(5, [Validators.min(0), Validators.max(100)]),
    calculationBasis: new FormControl('LABOUR_ONLY', [Validators.required]),
    qualifyingEvent: new FormControl('COMPLETION_VERIFIED', [Validators.required]),
    effectiveFrom: new FormControl('', [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogRuleForm>,
    public util: UtilService,
    public api: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadServices();
  }

  loadCategories(): void {
    this.api.get_private('v1/local-services/admin/catalog/categories?limit=100').subscribe({
      next: (response: any) => {
        const categories: any[] = (response && response.results) || [];
        this.parentCategories = categories
          .filter((category: any) => !category.parent)
          .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  loadServices(): void {
    this.api.get_private('v1/local-services/admin/catalog/services?limit=200').subscribe({
      next: (response: any) => {
        this.services = (response && response.results) || [];
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  get f() {
    return this.ruleForm.controls;
  }

  onConfirm() {
    this.haveSubmitClicked = true;
    if (this.ruleForm.invalid || this.isSubmit) return;
    this.isSubmit = true;
    const v: any = this.ruleForm.value;
    const effectiveFrom = v.effectiveFrom instanceof Date
      ? `${v.effectiveFrom.getFullYear()}-${String(v.effectiveFrom.getMonth() + 1).padStart(2, '0')}-${String(v.effectiveFrom.getDate()).padStart(2, '0')}`
      : v.effectiveFrom;
    const body: any = {
      ...v,
      effectiveFrom,
      categoryKey: v.categoryKey || null,
      serviceKey: v.serviceKey || null,
      commissionType: 'percentage',
      commissionFixedAmount: 0,
      minimumCharge: 0,
      maximumCharge: 0,
      currency: 'INR',
    };
    this.api.post_private('v1/local-services/admin/revenue/rules', body).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        this.dialogRef.close({ event: 'update', data: response });
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onCancel() {
    this.dialogRef.close({ event: 'cancel' });
  }
}
