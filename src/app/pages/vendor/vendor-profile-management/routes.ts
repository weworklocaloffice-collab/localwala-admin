import { Routes } from '@angular/router';
import { EditVendorDetails } from './edit-vendor-details/edit-vendor-details';
import { EditScheduleTime } from './edit-schedule-time/edit-schedule-time';
import { EditMenuPhotos } from './edit-menu-photos/edit-menu-photos';
import { VendorChatList } from './vendor-chat-list/vendor-chat-list';
import { VendorTaxationList } from './vendor-taxation-list/vendor-taxation-list';
import { VendorReviewList } from './vendor-review-list/vendor-review-list';
import { VendorDiningSettings } from './vendor-dining-settings/vendor-dining-settings';
import { VendorWalletAccount } from './vendor-wallet-account/vendor-wallet-account';
import { VendorExpenseReports } from './vendor-expense-reports/vendor-expense-reports';
import { VendorProfileSetting } from './vendor-profile-setting/vendor-profile-setting';
import { VendorNotificationList } from './vendor-notification-list/vendor-notification-list';

export const VendorProfileManagementRoutes: Routes = [
  {
    path: 'edit-vendor-detail',
    component: EditVendorDetails,
    data: {
      title: 'edit_restaurant_detail'
    }
  },
  {
    path: 'edit-schedule-time',
    component: EditScheduleTime,
    data: {
      title: 'edit_schedule_time'
    }
  },
  {
    path: 'edit-menu-photos',
    component: EditMenuPhotos,
    data: {
      title: 'edit_menu_photos'
    }
  },
  {
    path: 'vendor-chat-list',
    component: VendorChatList,
    data: {
      title: 'vendor_chat'
    }
  },
  {
    path: 'vendor-taxation-list',
    component: VendorTaxationList,
    data: {
      title: 'vendor_taxation_list'
    }
  },
  {
    path: 'vendor-review-list',
    component: VendorReviewList,
    data: {
      title: 'vendor_review_list'
    }
  },
  {
    path: 'vendor-dining-setting',
    component: VendorDiningSettings,
    data: {
      title: 'vendor_dining_setting'
    }
  },
  {
    path: 'vendor-wallet-account',
    component: VendorWalletAccount,
    data: {
      title: 'wallet'
    }
  },
  {
    path: 'vendor-expense-report',
    component: VendorExpenseReports,
    data: {
      title: 'vendor_expense_report'
    }
  },
  {
    path: 'profile-setting',
    component: VendorProfileSetting,
    data: {
      title: 'profile_setting'
    }
  },
  {
    path: 'notification-list',
    component: VendorNotificationList,
    data: {
      title: 'notifications'
    }
  }
];
