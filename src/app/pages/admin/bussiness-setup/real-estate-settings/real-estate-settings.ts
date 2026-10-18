import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

/**
 * Vertical-wide Real Estate configuration (plan §15.7).
 *
 * Home for OD-01 (Hold & Custody) + OD-04 (Tax & Invoicing) alongside
 * order/driver/restaurant settings — not inside real-estate-management.
 *
 * Runtime contract:
 * - Draft saved -> approval evidence recorded -> authorized approval ->
 *   configuration activated -> NEW transactions use active version.
 * - Invoices / refunds / reports save snapshots; updating settings here
 *   must never rewrite historical records (BR-15).
 * - Four supplies stay separate: LISTING_PACKAGE_PAYMENT,
 *   PROPERTY_SALE_COMMISSION, PROPERTY_HOLD, PROPERTY_HOLD_SERVICE_FEE.
 *
 * Roles:
 * - Admin operator: draft + edit.
 * - Finance/legal approver: approve within authority.
 * - Authorized administrator: activate an approved version.
 * - Auditor: view history (read-only routes).
 */
interface ApprovalBlock {
  status: string;
  approvedBy: string;
  approvedAt: string;
  effectiveFrom: string;
  effectiveTo: string;
  approvalReference: string;
  configurationVersion: string;
  changeReason: string;
}

interface HoldCustody extends ApprovalBlock {
  custodyMode: string;
  custodianBankReference: string;
  accountIdentifier: string;
  principalReleaseConditions: string;
  refundSLA: string;
  reconciliationFrequency: string;
  supportingDocuments: string;
}

interface TaxSupply {
  taxClassification: string;
  approvedRate: number | null;
  invoiceTreatment: string;
  taxComponents: string;
  inclusivePricing: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  approvalStatus: string;
  approvedBy: string;
  approvedAt: string;
  approvalReference: string;
}

interface TaxInvoicing extends ApprovalBlock {
  holdServiceFee: TaxSupply;
  propertySaleCommission: TaxSupply;
  holdPrincipal: TaxSupply;
  listingPackageFee: TaxSupply;
}

@Component({
  selector: 'app-real-estate-settings',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './real-estate-settings.html',
})
export class RealEstateSettings {
  isLoaded: boolean = false;
  isSaving: boolean = false;
  form: any = {};

  flags = [
    'enabled',
    'enquiryRequiresContactVerified',
    'autoAssignVisitRequests',
    'customerCanRequestLoan',
    'customerCanHoldProperty',
    'referralCommissionEnabled',
    'promotionsEnabled',
    'notificationsEnabled',
  ];

  numbers: { key: string; min: number }[] = [
    { key: 'defaultCheckInRadiusMeters', min: 1 },
    { key: 'defaultHoldDurationDays', min: 1 },
    { key: 'searchMaxRadiusKm', min: 1 },
    { key: 'listingMaxImages', min: 1 },
    { key: 'listingMaxVideos', min: 0 },
  ];

  // NOTE: approval-status option lists were removed with the read-only
  // approval controls — approval happens via the hold-policy case workflow,
  // never from this screen. Do not re-add selects bound to these arrays.
  custodyModes = ['ESCROW', 'CUSTODIAL', 'PLATFORM_CURRENT'];

  holdCustody: HoldCustody = RealEstateSettings.defaultHoldCustody();
  taxInvoicing: TaxInvoicing = RealEstateSettings.defaultTaxInvoicing();

  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {}

  static defaultHoldCustody(): HoldCustody {
    return {
      custodyMode: 'PLATFORM_CURRENT',
      custodianBankReference: '',
      accountIdentifier: '',
      principalReleaseConditions: '',
      refundSLA: '',
      reconciliationFrequency: 'weekly',
      supportingDocuments: '',
      status: 'DRAFT',
      approvedBy: '',
      approvedAt: '',
      effectiveFrom: '',
      effectiveTo: '',
      approvalReference: '',
      configurationVersion: '1.0',
      changeReason: '',
    };
  }

  static defaultSupply(): TaxSupply {
    return {
      taxClassification: '',
      approvedRate: null,
      invoiceTreatment: '',
      taxComponents: '',
      inclusivePricing: false,
      effectiveFrom: '',
      effectiveTo: '',
      approvalStatus: 'pending',
      approvedBy: '',
      approvedAt: '',
      approvalReference: '',
    };
  }

  static defaultTaxInvoicing(): TaxInvoicing {
    return {
      holdServiceFee: RealEstateSettings.defaultSupply(),
      propertySaleCommission: RealEstateSettings.defaultSupply(),
      holdPrincipal: RealEstateSettings.defaultSupply(),
      listingPackageFee: RealEstateSettings.defaultSupply(),
      status: 'DRAFT',
      approvedBy: '',
      approvedAt: '',
      effectiveFrom: '',
      effectiveTo: '',
      approvalReference: '',
      configurationVersion: '1.0',
      changeReason: '',
    };
  }

  get custodyApproved(): boolean {
    return this.holdCustody.status === 'ACTIVE' || this.holdCustody.status === 'APPROVED';
  }

  get custodyLiveBlocked(): boolean {
    return !this.custodyApproved;
  }

  taxActive(supply: TaxSupply): boolean {
    return supply.approvalStatus === 'approved' && supply.approvedRate != null && !!supply.taxClassification;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoaded = false;
    this.api.get_private('v1/realestate/admin/settings').subscribe({
      next: (response: any) => {
        const data = (response && response.data) || {};
        this.form = data;
        if (data.holdCustody && typeof data.holdCustody === 'object') {
          const docs = Array.isArray(data.holdCustody.supportingDocuments)
            ? data.holdCustody.supportingDocuments.join('\n')
            : (data.holdCustody.supportingDocuments || '');
          this.holdCustody = { ...RealEstateSettings.defaultHoldCustody(), ...data.holdCustody, supportingDocuments: docs };
        }
        if (data.taxInvoicing && typeof data.taxInvoicing === 'object') {
          const merged = RealEstateSettings.defaultTaxInvoicing();
          for (const k of ['holdServiceFee', 'propertySaleCommission', 'holdPrincipal', 'listingPackageFee'] as const) {
            if (data.taxInvoicing[k]) merged[k] = { ...RealEstateSettings.defaultSupply(), ...data.taxInvoicing[k] };
          }
          const { holdServiceFee, propertySaleCommission, holdPrincipal, listingPackageFee, ...rest } = data.taxInvoicing;
          this.taxInvoicing = { ...merged, ...rest };
        }
        this.isLoaded = true;
      },
      error: (error: any) => {
        this.isLoaded = true;
        this.util.handleError(error, 'admin');
      },
    });
  }

  canEdit(): boolean {
    return this.util.hasRight('realestate.admin_manage_listings');
  }

  onSave() {
    this.isSaving = true;
    const payload: any = {};
    for (const k of [...this.flags, ...this.numbers.map((n) => n.key)]) {
      if (this.form[k] !== undefined) payload[k] = this.form[k];
    }
    const docs = (this.holdCustody.supportingDocuments || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    payload.holdCustody = { ...this.holdCustody, supportingDocuments: docs };
    // Masked in UI — send as-is; backend stores reference only.
    payload.taxInvoicing = { ...this.taxInvoicing };
    this.api.patch_private('v1/realestate/admin/settings', payload).subscribe({
      next: (response: any) => {
        const data = (response && response.data) || payload;
        this.form = data;
        this.isSaving = false;
        this.util.onSuccess('ts_status_updated');
      },
      error: (error: any) => {
        this.isSaving = false;
        this.util.handleError(error, 'admin');
      },
    });
  }
}
