import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Properties } from './properties/properties';
import { Holds } from './holds/holds';
import { Refunds } from './refunds/refunds';
import { CommissionRules } from './commission-rules/commission-rules';
import { Settlements } from './settlements/settlements';
import { Ledger } from './ledger/ledger';
import { Vendors } from './vendors/vendors';
import { Leads } from './leads/leads';
import { Visits } from './visits/visits';
import { Loans } from './loans/loans';
import { Documents } from './documents/documents';
import { AuditLogs } from './audit-logs/audit-logs';
import { Promotions } from './promotions/promotions';
import { Banks } from './banks/banks';
import { Categories } from './categories/categories';
import { HoldPolicy } from './hold-policy/hold-policy';
import { ListingPackages } from './listing-packages/listing-packages';
import { PackagePayments } from './package-payments/package-payments';
import { PropertyVerification } from './property-verification/property-verification';
import { Executives } from './executives/executives';
import { ExecutiveAssignment } from './executive-assignment/executive-assignment';
import { Referrals } from './referrals/referrals';
import { VendorVerification } from './vendor-verification/vendor-verification';
import { BankOffers } from './bank-offers/bank-offers';
import { BankAgreements } from './bank-agreements/bank-agreements';
import { Sales } from './sales/sales';
import { HoldPayments } from './hold-payments/hold-payments';
import { SaleCommissions } from './sale-commissions/sale-commissions';
import { ReferralEarnings } from './referral-earnings/referral-earnings';
import { ExecutiveEarnings } from './executive-earnings/executive-earnings';
import { BankCommissions } from './bank-commissions/bank-commissions';
import { Reports } from './reports/reports';
import { Compliance } from './compliance/compliance';
import { Approvals } from './approvals/approvals';
import { Reconciliation } from './reconciliation/reconciliation';
import { CustodyStatements } from './custody-statements/custody-statements';
import { Invoices } from './invoices/invoices';

export const RealEstateManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    data: {
      title: 'realEstate_dashboard',
    },
  },
  {
    path: 'properties',
    component: Properties,
    data: {
      title: 'realEstate_properties',
    },
  },
  {
    path: 'holds',
    component: Holds,
    data: {
      title: 'realEstate_holds',
    },
  },
  {
    path: 'refunds',
    component: Refunds,
    data: {
      title: 'realEstate_refunds',
    },
  },
  {
    path: 'commission-rules',
    component: CommissionRules,
    data: {
      title: 'realEstate_commission_rules',
    },
  },
  {
    path: 'settlements',
    component: Settlements,
    data: {
      title: 'realEstate_settlements',
    },
  },
  {
    path: 'ledger',
    component: Ledger,
    data: {
      title: 'realEstate_ledger',
    },
  },
  {
    path: 'vendors',
    component: Vendors,
    data: {
      title: 'realEstate_vendors',
    },
  },
  {
    path: 'leads',
    component: Leads,
    data: {
      title: 'realEstate_leads_title',
    },
  },
  {
    path: 'visits',
    component: Visits,
    data: {
      title: 'realEstate_visits',
    },
  },
  {
    path: 'loans',
    component: Loans,
    data: {
      title: 'realEstate_loans',
    },
  },
  {
    path: 'documents',
    component: Documents,
    data: {
      title: 'realEstate_documents',
    },
  },
  {
    path: 'audit-logs',
    component: AuditLogs,
    data: {
      title: 'realEstate_audit_logs',
    },
  },
  {
    path: 'promotions',
    component: Promotions,
    data: {
      title: 'realEstate_promotions',
    },
  },
  {
    path: 'banks',
    component: Banks,
    data: {
      title: 'realEstate_banks',
    },
  },
  {
    path: 'categories',
    component: Categories,
    data: {
      title: 'realEstate_categories',
    },
  },
  {
    path: 'hold-policy',
    component: HoldPolicy,
    data: {
      title: 'realEstate_hold_policy',
    },
  },
  {
    path: 'listing-packages',
    component: ListingPackages,
    data: {
      title: 'realEstate_listing_packages',
    },
  },
  {
    path: 'package-payments',
    component: PackagePayments,
    data: {
      title: 'realEstate_package_payments',
    },
  },
  {
    path: 'property-verification',
    component: PropertyVerification,
    data: {
      title: 'realEstate_property_verification',
    },
  },
  {
    path: 'executives',
    component: Executives,
    data: {
      title: 'realEstate_executives',
    },
  },
  {
    path: 'executive-assignment',
    component: ExecutiveAssignment,
    data: {
      title: 'realEstate_executive_assignment',
    },
  },
  {
    path: 'referrals',
    component: Referrals,
    data: {
      title: 'realEstate_referrals',
    },
  },
  {
    path: 'vendor-verification',
    component: VendorVerification,
    data: {
      title: 'realEstate_vendor_verification',
    },
  },
  {
    path: 'bank-offers',
    component: BankOffers,
    data: {
      title: 'realEstate_bank_offers',
    },
  },
  {
    path: 'bank-agreements',
    component: BankAgreements,
    data: {
      title: 'realEstate_bank_agreements',
    },
  },
  {
    path: 'sales',
    component: Sales,
    data: {
      title: 'realEstate_sales',
    },
  },
  {
    path: 'sale-commissions',
    component: SaleCommissions,
    data: {
      title: 'realEstate_sale_commissions',
    },
  },
  {
    path: 'referral-earnings',
    component: ReferralEarnings,
    data: {
      title: 'realEstate_referral_earnings',
    },
  },
  {
    path: 'executive-earnings',
    component: ExecutiveEarnings,
    data: {
      title: 'realEstate_executive_earnings',
    },
  },
  {
    path: 'bank-commissions',
    component: BankCommissions,
    data: {
      title: 'realEstate_bank_commissions',
    },
  },
  {
    path: 'hold-payments',
    component: HoldPayments,
    data: {
      title: 'realEstate_hold_payments',
    },
  },
  {
    path: 'reports',
    component: Reports,
    data: {
      title: 'realEstate_reports',
    },
  },
  {
    path: 'compliance',
    component: Compliance,
    data: {
      title: 'realEstate_compliance',
    },
  },
  {
    path: 'approvals',
    component: Approvals,
    data: {
      title: 'realEstate_approvals',
    },
  },
  {
    path: 'reconciliation',
    component: Reconciliation,
    data: {
      title: 'realEstate_reconciliation',
    },
  },
  {
    path: 'custody-statements',
    component: CustodyStatements,
    data: {
      title: 'realEstate_custody_statements',
    },
  },
  {
    path: 'invoices',
    component: Invoices,
    data: {
      title: 'realEstate_invoices',
    },
  },
];
