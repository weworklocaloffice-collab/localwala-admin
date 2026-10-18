import { Routes } from '@angular/router';
import { VendorKitchenOwnerList } from './vendor-kitchen-owner-list/vendor-kitchen-owner-list';
import { DialogVendorKitchenOwner } from './vendor-kitchen-owner-list/dialog-vendor-kitchen-owner/dialog-vendor-kitchen-owner';

export const VendorKitchenManagementRoutes: Routes = [
  {
    path: 'list',
    component: VendorKitchenOwnerList,
    data: {
      title: 'kitchen_owner_list'
    }
  },
  {
    path: 'new-kitchen-owner',
    component: DialogVendorKitchenOwner,
    data: {
      title: 'add_kitchen_owner'
    }
  },
  {
    path: 'update-kitchen-owner/:id',
    component: DialogVendorKitchenOwner,
    data: {
      title: 'update_kitchen_owner'
    }
  }
];
