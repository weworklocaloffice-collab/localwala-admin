import { Routes } from '@angular/router';
import { Verticals } from './verticals/verticals';
import { Categories } from './categories/categories';
import { SubCategories } from './sub-categories/sub-categories';
import { Brands } from './brands/brands';
import { JoiningRequests } from './joining-requests/joining-requests';
import { Outlets } from './outlets/outlets';
import { Settlements } from './settlements/settlements';
import { Franchises } from './franchises/franchises';
import { CommissionPartners } from './partners/partners';
import { Compliance } from './compliance/compliance';
import { Orders } from './orders/orders';
import { Runs } from './runs/runs';
import { Drivers } from './drivers/drivers';
import { CoverageRequests } from './coverage-requests';
import { DairyMarketing } from './marketing';
import { DairyReports } from './reports';

export const DairyManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'joining-requests',
    pathMatch: 'full',
  },
  {
    path: 'joining-requests',
    component: JoiningRequests,
    data: {
      title: 'dairy_joining_requests',
    },
  },
  {
    path: 'outlets',
    component: Outlets,
    data: {
      title: 'dairy_outlets',
    },
  },
  {
    path: 'orders',
    component: Orders,
    data: {
      title: 'dairy_orders',
    },
  },
  {
    path: 'runs',
    component: Runs,
    data: {
      title: 'dairy_runs',
    },
  },
  {
    path: 'drivers',
    component: Drivers,
    data: {
      title: 'dairy_drivers',
    },
  },
  {
    path: 'coverage-requests',
    component: CoverageRequests,
    data: { title: 'dairy_coverage_requests' },
  },
  {
    path: 'marketing',
    component: DairyMarketing,
    data: { title: 'dairy_marketing' },
  },
  { path: 'reports', component: DairyReports, data: { title: 'dairy_reports' } },
  {
    path: 'verticals',
    component: Verticals,
    data: {
      title: 'dairy_verticals',
    },
  },
  {
    path: 'settlements',
    component: Settlements,
    data: {
      title: 'dairy_settlements',
    },
  },
  {
    path: 'franchises',
    component: Franchises,
    data: {
      title: 'dairy_franchises',
    },
  },
  {
    path: 'commission-partners',
    component: CommissionPartners,
    data: {
      title: 'dairy_commission_partners',
    },
  },
  {
    path: 'compliance',
    component: Compliance,
    data: {
      title: 'dairy_compliance',
    },
  },
  {
    path: 'categories',
    component: Categories,
    data: {
      title: 'dairy_categories',
    },
  },
  {
    path: 'sub-categories',
    component: SubCategories,
    data: {
      title: 'dairy_sub_categories',
    },
  },
  {
    path: 'brands',
    component: Brands,
    data: {
      title: 'dairy_brands',
    },
  },
];
