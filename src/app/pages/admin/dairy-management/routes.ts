import { Routes } from '@angular/router';
import { Verticals } from './verticals/verticals';
import { Categories } from './categories/categories';
import { SubCategories } from './sub-categories/sub-categories';
import { Brands } from './brands/brands';
import { JoiningRequests } from './joining-requests/joining-requests';
import { Outlets } from './outlets/outlets';
import { Settlements } from './settlements/settlements';
import { Franchises } from './franchises/franchises';
import { Compliance } from './compliance/compliance';

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
