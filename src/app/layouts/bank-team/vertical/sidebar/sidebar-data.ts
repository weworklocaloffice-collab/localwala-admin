import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/bank-team',
    isPrivate: false,
    key: 'dashboard',
  },
  {
    navCap: 'loan_management',
    isPrivate: false,
    key: 'loan',
  },
  {
    displayName: 'loan_applications',
    iconName: 'tablerFileDescription',
    route: '/bank-team/u/applications',
    isPrivate: false,
    key: 'loan'
  },
  {
    displayName: 'bank_loan_leads',
    iconName: 'tablerInbox',
    route: '/bank-team/u/loan-leads',
    isPrivate: false,
    key: 'loan'
  },
  {
    displayName: 'bank_dashboard',
    iconName: 'tablerLayout',
    route: '/bank-team/u/dashboard',
    isPrivate: false,
    key: 'dashboard'
  },
  {
    displayName: 'bank_documents',
    iconName: 'tablerFileText',
    route: '/bank-team/u/documents',
    isPrivate: false,
    key: 'documents'
  },
  {
    displayName: 'bank_offers',
    iconName: 'tablerTag',
    route: '/bank-team/u/offers',
    isPrivate: false,
    key: 'loan'
  },
  {
    displayName: 'bank_customers',
    iconName: 'tablerUsers',
    route: '/bank-team/u/customers',
    isPrivate: false,
    key: 'customers'
  },
  {
    displayName: 'bank_commissions',
    iconName: 'tablerReceipt',
    route: '/bank-team/u/commissions',
    isPrivate: false,
    key: 'commissions'
  },
  {
    displayName: 'change_password',
    iconName: 'tablerLock',
    route: '/bank-team/u/change-password',
    isPrivate: false,
    key: 'account'
  },
  {
    displayName: 'bank_profile',
    iconName: 'tablerUser',
    route: '/bank-team/u/profile',
    isPrivate: false,
    key: 'account'
  },
];
