import { Routes } from '@angular/router';
import { VendorWaiterList } from './vendor-waiter-list/vendor-waiter-list';
import { DialogVendorWaiter } from './vendor-waiter-list/dialog-vendor-waiter/dialog-vendor-waiter';

export const VendorWaiterManagementRoutes: Routes = [
  {
    path: 'list',
    component: VendorWaiterList,
    data: {
      title: 'waiter_list'
    }
  },
  {
    path: 'new-waiter',
    component: DialogVendorWaiter,
    data: {
      title: 'add_waiter'
    }
  },
  {
    path: 'update-waiter/:id',
    component: DialogVendorWaiter,
    data: {
      title: 'update_waiter'
    }
  }
];
