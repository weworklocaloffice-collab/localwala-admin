import { Routes } from '@angular/router';
import { CustomerList } from './customer-list/customer-list';
import { WalletAddFund } from './wallet-add-fund/wallet-add-fund';
import { WalletBonus } from './wallet-bonus/wallet-bonus';
import { LoyaltyPointReport } from './loyalty-point-report/loyalty-point-report';
import { UserDeletedAccounts } from './admin-deleted-account/user-deleted-accounts/user-deleted-accounts';
import { RestaurantDeletedAccounts } from './admin-deleted-account/restaurant-deleted-accounts/restaurant-deleted-accounts';
import { DeliverymanDeletedAccounts } from './admin-deleted-account/deliveryman-deleted-accounts/deliveryman-deleted-accounts';
import { WaiterDeletedAccounts } from './admin-deleted-account/waiter-deleted-accounts/waiter-deleted-accounts';
import { KitchenDeletedAccounts } from './admin-deleted-account/kitchen-deleted-accounts/kitchen-deleted-accounts';
import { AdminChatListWidget } from './admin-chat-list-widget/admin-chat-list-widget';
import { AdminNotificationListWidget } from './admin-notification-list-widget/admin-notification-list-widget';
import { CustomerDetail } from './customer-list/customer-detail/customer-detail';

export const CustomerManagementRoutes: Routes = [
  {
    path: 'customers',
    component: CustomerList,
    data: {
      title: 'customer_list'
    }
  },
  {
    path: 'customer-detail/:id',
    component: CustomerDetail,
    data: {
      title: 'customer_details'
    }
  },
  {
    path: 'wallet-add-fund',
    component: WalletAddFund,
    data: {
      title: 'add_fund'
    }
  },
  {
    path: 'wallet-bonus',
    component: WalletBonus,
    data: {
      title: 'wallet_bonus'
    }
  },
  {
    path: 'loyalty-points-report',
    component: LoyaltyPointReport,
    data: {
      title: 'loyalty_point_report'
    }
  },
  {
    path: 'customer-deleted-account',
    component: UserDeletedAccounts,
    data: {
      title: 'deleted_customer_account'
    }
  },
  {
    path: 'restaurant-deleted-account',
    component: RestaurantDeletedAccounts,
    data: {
      title: 'deleted_restaurant_account'
    }
  },
  {
    path: 'deliveryman-deleted-account',
    component: DeliverymanDeletedAccounts,
    data: {
      title: 'deleted_deliveryman_account'
    }
  },
  {
    path: 'waiter-deleted-account',
    component: WaiterDeletedAccounts,
    data: {
      title: 'deleted_waiter_account'
    }
  },
  {
    path: 'kitchen-deleted-accounts',
    component: KitchenDeletedAccounts,
    data: {
      title: 'deleted_kitchen_account'
    }
  },
  {
    path: 'chat-list',
    component: AdminChatListWidget,
    data: {
      title: 'chat_list'
    }
  },
  {
    path: 'notification-list',
    component: AdminNotificationListWidget,
    data: {
      title: 'notification_list'
    }
  }
];
