import { Routes } from '@angular/router';
import { LsOverview } from './ls-overview/ls-overview';
import { RevenueDashboard } from './revenue-dashboard/revenue-dashboard';
import { RevenueRules } from './revenue-rules/revenue-rules';
import { RevenueEntries } from './revenue-entries/revenue-entries';
import { Settlements } from './settlements/settlements';
import { LsCategories } from './ls-categories/ls-categories';
import { LsSubcategories } from './ls-subcategories/ls-subcategories';
import { LsProviders } from './ls-providers/ls-providers';
import { LsProviderTypes } from './ls-provider-types/ls-provider-types';
import { LsApplications } from './ls-applications/ls-applications';
import { LsModeration } from './ls-moderation/ls-moderation';
import { LsRecurring } from './ls-recurring/ls-recurring';
import { LsBookings } from './ls-bookings/ls-bookings';
import { LsBookingDetail } from './ls-booking-detail/ls-booking-detail';
import { LsServices } from './ls-services/ls-services';
import { LsFacets } from './ls-facets/ls-facets';
import { LsTemplates } from './ls-templates/ls-templates';
import { LsRefunds } from './ls-refunds/ls-refunds';
import { LsDocuments } from './ls-documents/ls-documents';
import { LsProviderDetail } from './ls-provider-detail/ls-provider-detail';
import { LsVariants } from './ls-variants/ls-variants';
import { LsAddons } from './ls-addons/ls-addons';
import { LsMapping } from './ls-mapping/ls-mapping';
import { Promotions } from './promotions/promotions';
import { Reports } from './reports/reports';
import { LocalServicesAuditLogs } from './audit-logs/audit-logs';
import { FeaturedPlans } from './plans/plans';
import { LsResources } from './ls-resources/ls-resources';
import { LsAssignments } from './ls-assignments/ls-assignments';
import { LsPolicies } from './ls-policies/ls-policies';
import { LsInvoices } from './ls-invoices/ls-invoices';
import { LsReviews } from './ls-reviews/ls-reviews';
import { LsAvailabilityRules } from './ls-availability-rules/ls-availability-rules';
import { LsPayments } from './ls-payments/ls-payments';
import { LsBookingConfig } from './ls-booking-config/ls-booking-config';
import { LsTaxConfig } from './ls-tax-config/ls-tax-config';
import { LsPermissions } from './ls-permissions/ls-permissions';
import { LsSettings } from './ls-settings/ls-settings';
import { MarketingPackages } from './marketing-packages/marketing-packages';
import { MarketingCampaigns } from './marketing-campaigns/marketing-campaigns';

export const LocalServicesManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    component: LsOverview,
    data: {
      title: 'ls_overview',
    },
  },
  {
    path: 'revenue-dashboard',
    component: RevenueDashboard,
    data: {
      title: 'ls_revenue_dashboard',
    },
  },
  {
    path: 'revenue-rules',
    component: RevenueRules,
    data: {
      title: 'ls_revenue_rules',
    },
  },
  {
    path: 'revenue-entries',
    component: RevenueEntries,
    data: {
      title: 'ls_revenue_entries',
    },
  },
  {
    path: 'settlements',
    component: Settlements,
    data: {
      title: 'ls_settlements',
    },
  },
  {
    path: 'categories',
    component: LsCategories,
    data: {
      title: 'ls_categories',
    },
  },
  {
    path: 'subcategories',
    component: LsSubcategories,
    data: {
      title: 'ls_subcategories',
    },
  },
  {
    path: 'providers',
    component: LsProviders,
    data: {
      title: 'ls_providers',
    },
  },
  {
    path: 'provider-types',
    component: LsProviderTypes,
    data: {
      title: 'ls_providers',
    },
  },
  {
    path: 'applications',
    component: LsApplications,
    data: {
      title: 'ls_applications',
    },
  },
  {
    path: 'moderation',
    component: LsModeration,
    data: {
      title: 'ls_moderation',
    },
  },
  {
    path: 'recurring',
    component: LsRecurring,
    data: {
      title: 'ls_recurring',
    },
  },
  {
    path: 'bookings',
    component: LsBookings,
    data: {
      title: 'ls_bookings',
    },
  },
  {
    path: 'bookings/:id',
    component: LsBookingDetail,
    data: {
      title: 'ls_booking_detail',
    },
  },
  {
    path: 'services',
    component: LsServices,
    data: {
      title: 'ls_services',
    },
  },
  {
    path: 'facets',
    component: LsFacets,
    data: {
      title: 'ls_facets',
    },
  },
  {
    path: 'templates',
    component: LsTemplates,
    data: {
      title: 'ls_templates',
    },
  },
  {
    path: 'refunds',
    component: LsRefunds,
    data: {
      title: 'ls_refunds',
    },
  },
  {
    path: 'documents',
    component: LsDocuments,
    data: {
      title: 'ls_documents',
    },
  },
  {
    path: 'providers/:id',
    component: LsProviderDetail,
    data: {
      title: 'ls_provider_detail',
    },
  },
  {
    path: 'variants',
    component: LsVariants,
    data: {
      title: 'ls_variants',
    },
  },
  {
    path: 'addons',
    component: LsAddons,
    data: {
      title: 'ls_addons',
    },
  },
  {
    path: 'mapping',
    component: LsMapping,
    data: {
      title: 'ls_mapping',
    },
  },
  {
    path: 'promotions',
    component: Promotions,
    data: {
      title: 'ls_promotions',
    },
  },
  {
    path: 'marketing-packages',
    component: MarketingPackages,
    data: {
      title: 'ls_marketing_packages',
    },
  },
  {
    path: 'marketing-campaigns',
    component: MarketingCampaigns,
    data: {
      title: 'ls_marketing_campaigns',
    },
  },
  {
    path: 'reports',
    component: Reports,
    data: {
      title: 'ls_reports',
    },
  },
  {
    path: 'audit-logs',
    component: LocalServicesAuditLogs,
    data: {
      title: 'ls_audit_logs',
    },
  },
  {
    path: 'plans',
    component: FeaturedPlans,
    data: {
      title: 'ls_plans',
    },
  },
  {
    path: 'resources',
    component: LsResources,
    data: {
      title: 'ls_resources',
    },
  },
  {
    path: 'assignments',
    component: LsAssignments,
    data: {
      title: 'ls_assignments',
    },
  },
  {
    path: 'policies',
    component: LsPolicies,
    data: {
      title: 'ls_policies',
    },
  },
  {
    path: 'invoices',
    component: LsInvoices,
    data: {
      title: 'ls_invoices',
    },
  },
  {
    path: 'reviews',
    component: LsReviews,
    data: {
      title: 'ls_reviews',
    },
  },
  {
    path: 'availability-rules',
    component: LsAvailabilityRules,
    data: {
      title: 'ls_availability_rules',
    },
  },
  {
    path: 'payments',
    component: LsPayments,
    data: {
      title: 'ls_payments',
    },
  },
  {
    path: 'booking-config',
    component: LsBookingConfig,
    data: {
      title: 'ls_booking_config',
    },
  },
  {
    path: 'tax-config',
    component: LsTaxConfig,
    data: {
      title: 'ls_tax_config',
    },
  },
  {
    path: 'permissions',
    component: LsPermissions,
    data: {
      title: 'ls_permissions',
    },
  },
  {
    path: 'settings',
    component: LsSettings,
    data: {
      title: 'ls_settings',
    },
  },
];
