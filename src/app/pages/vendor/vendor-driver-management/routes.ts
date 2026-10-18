import { Routes } from '@angular/router';
import { ManageVendorDriver } from './vendor-driver/manage-vendor-driver/manage-vendor-driver';
import { VendorDriver } from './vendor-driver/vendor-driver';

export const VendorDriverManagementRoutes: Routes = [
  {
    path: 'add',
    component: ManageVendorDriver,
    data: {
      title: 'add_delivery_partner'
    }
  },
  {
    path: 'edit/:id',
    component: ManageVendorDriver,
    data: {
      title: 'update_delivery_partner'
    }
  },
  {
    path: 'list',
    component: VendorDriver,
    data: {
      title: 'delivery_partner_management'
    }
  }
];
