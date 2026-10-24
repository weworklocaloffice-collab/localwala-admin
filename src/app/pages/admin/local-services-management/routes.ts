import { Routes } from '@angular/router';
import { RevenueDashboard } from './revenue-dashboard/revenue-dashboard';
import { RevenueRules } from './revenue-rules/revenue-rules';
import { RevenueEntries } from './revenue-entries/revenue-entries';
import { Settlements } from './settlements/settlements';
import { LsCategories } from './ls-categories/ls-categories';
import { LsProviders } from './ls-providers/ls-providers';
import { LsBookings } from './ls-bookings/ls-bookings';
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

export const LocalServicesManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'revenue-dashboard',
    pathMatch: 'full',
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
    path: 'providers',
    component: LsProviders,
    data: {
      title: 'ls_providers',
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
];
