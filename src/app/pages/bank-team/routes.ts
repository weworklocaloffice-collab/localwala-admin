import { Routes } from '@angular/router';
import { Applications } from './applications/applications';
import { ApplicationDetail } from './application-detail/application-detail';
import { Offers } from './offers/offers';
import { ChangePassword } from './change-password/change-password';

import { Dashboard } from './dashboard/dashboard';

import { Documents } from './documents/documents';
import { Customers } from './customers/customers';
import { CustomerDetail } from './customer-detail/customer-detail';
import { Commissions } from './commissions/commissions';
import { LoanLeads } from './loan-leads/loan-leads';
import { OfferForm } from './offer-form/offer-form';
import { Profile } from './profile/profile';

export const BankTeamRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'applications',
    component: Applications,
    data: {
      title: 'bank_applications',
    },
  },
  {
    path: 'applications/:id',
    component: ApplicationDetail,
    data: {
      title: 'bank_application_detail',
    },
  },
  {
    path: 'dashboard',
    component: Dashboard,
    data: {
      title: 'bank_dashboard',
    },
  },
  {
    path: 'documents',
    component: Documents,
    data: {
      title: 'bank_documents',
    },
  },
  {
    path: 'customers',
    component: Customers,
    data: {
      title: 'bank_customers',
    },
  },
  {
    path: 'customers/:id',
    component: CustomerDetail,
    data: {
      title: 'bank_customer_detail',
    },
  },
  {
    path: 'loan-leads',
    component: LoanLeads,
    data: {
      title: 'bank_loan_leads',
    },
  },
  {
    path: 'offers/new',
    component: OfferForm,
    data: {
      title: 'bank_new_offer',
    },
  },
  {
    path: 'profile',
    component: Profile,
    data: {
      title: 'bank_profile',
    },
  },
  {
    path: 'commissions',
    component: Commissions,
    data: {
      title: 'bank_commissions',
    },
  },
  {
    path: 'offers',
    component: Offers,
    data: {
      title: 'bank_offers',
    },
  },
  {
    path: 'change-password',
    component: ChangePassword,
    data: {
      title: 'change_password',
    },
  },
];
