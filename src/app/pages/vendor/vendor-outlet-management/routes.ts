import { Routes } from '@angular/router';
import { Outlets } from './outlet-management/outlets/outlets';
import { ManageOutlet } from './outlet-management/manage-outlet/manage-outlet';

export const VendorOutletManagementRoutes: Routes = [
  {
    path: 'list',
    component: Outlets,
    data: {
      title: 'outlet_management'
    }
  },
  {
    path: 'add',
    component: ManageOutlet,
    data: {
      title: 'add_outlet'
    }
  },
  {
    path: 'edit/:id',
    component: ManageOutlet,
    data: {
      title: 'update_outlet'
    }
  },
];
