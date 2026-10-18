import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Hold policy editor (plan §10.2 row 20).
 *
 * A single ACTIVE policy at a time. The editor edits the latest ACTIVE
 * row in place; the version timeline (newest version) is shown in the
 * history list below the form.
 */
@Component({
  selector: 'app-real-estate-hold-policy',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './hold-policy.html',
})
export class HoldPolicy {
  isLoaded: boolean = false;
  isSaving: boolean = false;
  active: any = {};
  history: any[] = [];
  error: string | null = null;

  // Form-bound model — written back to `active` on save.
  form: any = {};

  // Per-supply tax staging (OD-04). Each supply is approved independently
  // through its own TAX_CONFIG case: saving here stages a PENDING
  // determination and opens the case — it never approves. The approver
  // decides in the Approvals queue; approvalStatus is read-only here.
  taxSupplies: { key: string; label: string }[] = [
    { key: 'holdServiceFee', label: 'Hold service fee' },
    { key: 'propertySaleCommission', label: 'Property sale commission' },
    { key: 'holdPrincipal', label: 'Hold principal' },
    { key: 'listingPackageFee', label: 'Listing package fee' },
  ];
  taxForm: any = {};
  taxSaving: { [key: string]: boolean } = {};

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.isLoaded = false;
    this.error = null;
    this.api.get_private('v1/realestate/admin/hold-policy').subscribe({
      next: (response: any) => {
        const data = (response && response.data) || [];
        // Latest version is row 0 (service sorts version desc, createdAt desc).
        const all = Array.isArray(data) ? data : [];
        this.active = all.find((p: any) => p.status === 'ACTIVE') || all[0] || {};
        this.history = all.filter((p: any) => p !== this.active);
        this.form = { ...this.active };
        const taxConfig = (this.active && this.active.taxConfiguration) || {};
        this.taxForm = {};
        for (const s of this.taxSupplies) {
          const node = taxConfig[s.key] || {};
          this.taxForm[s.key] = {
            hsnSac: node.hsnSac || '',
            taxClassification: node.taxClassification || '',
            applicableRate: node.applicableRate ?? null,
            invoiceTreatment: node.invoiceTreatment || '',
            taxComponents: node.taxComponents || '',
            inclusivePricing: !!node.inclusivePricing,
            effectiveFrom: node.effectiveFrom || '',
            effectiveTo: node.effectiveTo || '',
            approvalReference: node.approvalReference || '',
            changeReason: '',
          };
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSave() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.api.patch_private('v1/realestate/admin/hold-policy/active', this.form).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  /**
   * Version timeline: a new DRAFT off the latest row. Terms carry
   * over, approvals reset. Live holds keep the ACTIVE row until the
   * draft is submitted → approved → activated (BR-15).
   */
  onNewVersion() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.api.post_private('v1/realestate/admin/hold-policy/versions', {}).subscribe({
      next: () => {
        this.isSaving = false;
        this.util.onSuccess('ts_created');
        this.getList();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onSubmitVersion(row: any) {
    this.api.post_private('v1/realestate/admin/hold-policy/submit', {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onApproveVersion(row: any) {
    this.api.post_private(`v1/realestate/admin/hold-policy/${row._id}/approve`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  onActivateVersion(row: any) {
    this.api.post_private(`v1/realestate/admin/hold-policy/${row._id}/activate`, {}).subscribe({
      next: () => {
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.util.handleError(error, 'admin');
      },
    });
  }

  taxNodeStatus(key: string): string {
    const taxConfig = (this.active && this.active.taxConfiguration) || {};
    return (taxConfig[key] && taxConfig[key].approvalStatus) || 'pending';
  }

  /**
   * Stage one supply's determination. The payload deliberately omits
   * approvalStatus — the server forces pending and opens the TAX_CONFIG
   * case. A second save while that case is open is rejected until the
   * case is decided (cancel it or wait).
   */
  onSaveTax(supplyKey: string) {
    if (this.taxSaving[supplyKey] || !this.active || !this.active._id) return;
    const src = this.taxForm[supplyKey] || {};
    const payload: any = {
      hsnSac: src.hsnSac || null,
      taxClassification: src.taxClassification || null,
      applicableRate: src.applicableRate === '' || src.applicableRate == null ? null : Number(src.applicableRate),
      invoiceTreatment: src.invoiceTreatment || null,
      taxComponents: src.taxComponents || null,
      inclusivePricing: !!src.inclusivePricing,
      approvalReference: src.approvalReference || null,
      changeReason: src.changeReason || null,
    };
    if (src.effectiveFrom) payload.effectiveFrom = src.effectiveFrom;
    if (src.effectiveTo) payload.effectiveTo = src.effectiveTo;
    this.taxSaving[supplyKey] = true;
    this.api.patch_private(`v1/realestate/admin/hold-policy/${this.active._id}/tax/${supplyKey}`, payload).subscribe({
      next: () => {
        this.taxSaving[supplyKey] = false;
        this.util.onSuccess('ts_status_updated');
        this.getList();
      },
      error: (error: any) => {
        this.taxSaving[supplyKey] = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
