import { Routes } from '@angular/router';
import { DashboardWidget } from './dashboard-widget/dashboard-widget';
import { AdminPosSection } from './admin-pos-section/admin-pos-section';

export const DashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardWidget,
    data: {
      title: 'dashboard',
    },
  },
  {
    path: 'pos',
    component: AdminPosSection,
    data: {
      title: 'pos'
    }
  }
];
