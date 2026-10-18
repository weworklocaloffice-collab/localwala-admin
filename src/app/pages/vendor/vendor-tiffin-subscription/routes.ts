import { Routes } from '@angular/router';
import { TiffinSubscriptionList } from './tiffin-subscription-list/tiffin-subscription-list';
import { ManageTiffinSubscription } from './tiffin-subscription-list/manage-tiffin-subscription/manage-tiffin-subscription';
import { TiffinSubscriptionPurchaseList } from './tiffin-subscription-purchase-list/tiffin-subscription-purchase-list';
import { PurchasedTiffinSubscriptionInfo } from './tiffin-subscription-purchase-list/purchased-tiffin-subscription-info/purchased-tiffin-subscription-info';

export const VendorTiffinSubscriptionRoutes: Routes = [
  {
    path: 'list',
    component: TiffinSubscriptionList,
    data: {
      title: 'subscription_tiffin_packages'
    }
  },
  {
    path: 'add-subscription-tiffin-package',
    component: ManageTiffinSubscription,
    data: {
      title: 'add_tiffin_package'
    }
  },
  {
    path: 'edit-subscription-tiffin-package/:id',
    component: ManageTiffinSubscription,
    data: {
      title: 'update_tiffin_package'
    }
  },
  {
    path: 'tiffin-subscription-purchase-list/:id',
    component: TiffinSubscriptionPurchaseList,
    data: {
      title: 'purchase_list_tiffin_package'
    }
  },
  {
    path: 'purchased-tiffin-subscription-purchase-info/:id',
    component: PurchasedTiffinSubscriptionInfo,
    data: {
      title: 'purchased_info_tiffin_packages'
    }
  },
];
