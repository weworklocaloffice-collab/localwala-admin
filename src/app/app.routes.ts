import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { adminAuthGuard } from './guard/admin-auth-guard';
import { AccountantTeamComponent } from './layouts/accountant-team/accountant-team.component';
import { accountantAuthGuard } from './guard/accountant-auth-guard';
import { SupportTeamComponent } from './layouts/support-team/support-team.component';
import { supportAuthGuard } from './guard/support-auth-guard';
import { CityMasterTeamComponent } from './layouts/city-master-team/city-master-team.component';
import { cityMasterAuthGuard } from './guard/city-master-auth-guard';
import { VendorComponent } from './layouts/vendor/vendor.component';
import { vendorAuthGuard } from './guard/vendor-auth-guard';
import { BankTeamComponent } from './layouts/bank-team/bank-team.component';
import { bankAuthGuard } from './guard/bank-auth-guard';
import { UserComponent } from './layouts/user/user.component';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/user/routes').then((m) => m.UserRoutes)
      }
    ]
  },
  {
    path: 'admin',
    component: FullComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboards',
        pathMatch: 'full',
      },
      {
        path: 'dashboards',
        loadChildren: () => import('./pages/admin/dashboards/routes').then((m) => m.DashboardRoutes),
      },
      {
        path: 'bussiness-setup',
        loadChildren: () => import('./pages/admin/bussiness-setup/routes').then((m) => m.BusinessSetupRoutes)
      },
      {
        path: 'system-settings',
        loadChildren: () => import('./pages/admin/system-settings/routes').then((m) => m.SystemSettingRoutes)
      },
      {
        path: 'subscriptions-management',
        loadChildren: () => import('./pages/admin/bussiness-setup/routes').then((m) => m.BusinessSetupRoutes)
      },
      {
        path: 'project-pages',
        loadChildren: () => import('./pages/admin/bussiness-setup/routes').then((m) => m.BusinessSetupRoutes)
      },
      {
        path: 'zone-setup',
        loadChildren: () => import('./pages/admin/restaurant-management/routes').then((m) => m.RestaurantManagementRoutes)
      },
      {
        path: 'restaurant-management',
        loadChildren: () => import('./pages/admin/restaurant-management/routes').then((m) => m.RestaurantManagementRoutes)
      },
      {
        path: 'restaurant',
        loadChildren: () => import('./pages/admin/restaurant-management/routes').then((m) => m.RestaurantManagementRoutes)
      },
      {
        path: 'media',
        loadChildren: () => import('./pages/admin/media/routes').then(m => m.MediaRoutes)
      },
      {
        path: 'dairy-management',
        loadChildren: () => import('./pages/admin/dairy-management/routes').then((m) => m.DairyManagementRoutes)
      },
      {
        path: 'local-services-management',
        loadChildren: () => import('./pages/admin/local-services-management/routes').then((m) => m.LocalServicesManagementRoutes)
      },
      {
        path: 'jhatka-management',
        loadChildren: () => import('./pages/admin/jhatka-management/routes').then((m) => m.JhatkaManagementRoutes)
      },
      {
        path: 'real-estate-management',
        loadChildren: () => import('./pages/admin/real-estate-management/routes').then((m) => m.RealEstateManagementRoutes)
      },
      {
        path: 'stores-management',
        loadChildren: () => import('./pages/admin/stores-management/routes').then((m) => m.StoresManagementRoutes)
      },
      {
        path: 'food-management',
        loadChildren: () => import('./pages/admin/food-management/routes').then((m) => m.FoodManagementRoutes)
      },
      {
        path: 'foods',
        loadChildren: () => import('./pages/admin/food-management/routes').then((m) => m.FoodManagementRoutes)
      },
      {
        path: 'delivery-management',
        loadChildren: () => import('./pages/admin/delivery-management/routes').then((m) => m.DeliveryManagementRoutes)
      },
      {
        path: 'customer-management',
        loadChildren: () => import('./pages/admin/customer-management/routes').then((m) => m.CustomerManagementRoutes)
      },
      {
        path: 'deleted-accounts',
        loadChildren: () => import('./pages/admin/customer-management/routes').then((m) => m.CustomerManagementRoutes)
      },
      {
        path: 'customer-wallet-management',
        loadChildren: () => import('./pages/admin/customer-management/routes').then((m) => m.CustomerManagementRoutes)
      },
      {
        path: 'driver-management',
        loadChildren: () => import('./pages/admin/delivery-management/routes').then((m) => m.DeliveryManagementRoutes)
      },
      {
        path: 'promotion-management',
        loadChildren: () => import('./pages/admin/promotion-management/routes').then((m) => m.PromotionManagementRoutes)
      },
      {
        path: 'banners',
        loadChildren: () => import('./pages/admin/promotion-management/routes').then((m) => m.PromotionManagementRoutes)
      },
      {
        path: 'reels',
        loadChildren: () => import('./pages/admin/reels/routes').then((m) => m.ReelsRoutes)
      },
      {
        path: 'coupons',
        loadChildren: () => import('./pages/admin/promotion-management/routes').then((m) => m.PromotionManagementRoutes)
      },
      {
        path: 'transaction',
        loadChildren: () => import('./pages/admin/transactions/routes').then((m) => m.TransactionRoutes)
      },
      {
        path: 'disbursements-transaction',
        loadChildren: () => import('./pages/admin/transactions/routes').then((m) => m.TransactionRoutes)
      },
      {
        path: 'order-management',
        loadChildren: () => import('./pages/admin/order-management/routes').then((m) => m.OrderManagementRoutes)
      },
      {
        path: 'feedback-report-list',
        loadChildren: () => import('./pages/admin/feedback-report/routes').then((m) => m.FeedbackManagmentRoutes)
      },
      {
        path: 'import-export-management',
        loadChildren: () => import('./pages/admin/import-export-management/routes').then((m) => m.ImportCollectionsManagmentRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./pages/admin/report-management/routes').then((m) => m.ReportManagementRoutes)
      },
      {
        path: 'order-reports',
        loadChildren: () => import('./pages/admin/report-management/routes').then((m) => m.ReportManagementRoutes)
      },
      {
        path: 'disbursement-reports',
        loadChildren: () => import('./pages/admin/report-management/routes').then((m) => m.ReportManagementRoutes)
      },
      {
        path: 'team-list',
        loadChildren: () => import('./pages/admin/role-management/routes').then((m) => m.RoleManagementRoutes)
      }
    ],
  },
  {
    path: 'accountant-team',
    component: AccountantTeamComponent,
    canActivate: [accountantAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/accountant-team/routes').then((m) => m.AccountantManagementRoutes)
      },
      {
        path: 'u',
        loadChildren: () => import('./pages/accountant-team/routes').then((m) => m.AccountantManagementRoutes)
      },
      {
        path: 'order-reports',
        loadChildren: () => import('./pages/accountant-team/routes').then((m) => m.AccountantManagementRoutes)
      },
      {
        path: 'disbursement',
        loadChildren: () => import('./pages/accountant-team/routes').then((m) => m.AccountantManagementRoutes)
      },
      {
        path: 'disbursement-reports',
        loadChildren: () => import('./pages/accountant-team/routes').then((m) => m.AccountantManagementRoutes)
      }
    ]
  },
  {
    path: 'bank-team',
    component: BankTeamComponent,
    canActivate: [bankAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/bank-team/routes').then((m) => m.BankTeamRoutes)
      },
      {
        path: 'u',
        loadChildren: () => import('./pages/bank-team/routes').then((m) => m.BankTeamRoutes)
      },
    ]
  },
  {
    path: 'support-team',
    component: SupportTeamComponent,
    canActivate: [supportAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/support-team/routes').then((m) => m.SupportManagementRoutes)
      },
      {
        path: 'u',
        loadChildren: () => import('./pages/support-team/routes').then((m) => m.SupportManagementRoutes)
      },
    ]
  },
  {
    path: 'cityzen-team',
    component: CityMasterTeamComponent,
    canActivate: [cityMasterAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/city-master-team/routes').then((m) => m.CityMasterManagementRoutes),
      },
      {
        path: 'u',
        loadChildren: () => import('./pages/city-master-team/routes').then((m) => m.CityMasterManagementRoutes),
      },
      {
        path: 'restaurant-section',
        loadChildren: () => import('./pages/city-master-team/routes').then((m) => m.CityMasterManagementRoutes),
      },
      {
        path: 'campaign-section',
        loadChildren: () => import('./pages/city-master-team/routes').then((m) => m.CityMasterManagementRoutes),
      }
    ]
  },
  {
    path: 'vendor',
    component: VendorComponent,
    canActivate: [vendorAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/vendor/vendor-dashboard/routes').then((m) => m.VendorDashboardRoutes)
      },
      {
        path: 'pos-management',
        loadChildren: () => import('./pages/vendor/vendor-dashboard/routes').then((m) => m.VendorDashboardRoutes)
      },
      {
        path: 'order-management',
        loadChildren: () => import('./pages/vendor/vendor-order-management/routes').then((m) => m.VendorOrderManagementRoutes)
      },
      {
        path: 'table-management',
        loadChildren: () => import('./pages/vendor/vendor-table-management/routes').then((m) => m.VendorTableManagementRoutes)
      },
      {
        path: 'table-prebooking',
        loadChildren: () => import('./pages/vendor/vendor-table-management/routes').then((m) => m.VendorTableManagementRoutes)
      },
      {
        path: 'driver-management',
        loadChildren: () => import('./pages/vendor/vendor-driver-management/routes').then((m) => m.VendorDriverManagementRoutes)
      },
      {
        path: 'promotion-management',
        loadChildren: () => import('./pages/vendor/vendor-promotion-management/routes').then((m) => m.VendorPromotionManagementRoutes)
      },
      {
        path: 'coupon-management',
        loadChildren: () => import('./pages/vendor/vendor-promotion-management/routes').then((m) => m.VendorPromotionManagementRoutes)
      },
      {
        path: 'categories-management',
        loadChildren: () => import('./pages/vendor/vendor-food-management/routes').then((m) => m.VendorFoodManagementRoutes)
      },
      {
        path: 'food-management',
        loadChildren: () => import('./pages/vendor/vendor-food-management/routes').then((m) => m.VendorFoodManagementRoutes)
      },
      {
        path: 'addon-management',
        loadChildren: () => import('./pages/vendor/vendor-food-management/routes').then((m) => m.VendorFoodManagementRoutes)
      },
      {
        path: 'outlet-management',
        loadChildren: () => import('./pages/vendor/vendor-outlet-management/routes').then((m) => m.VendorOutletManagementRoutes)
      },
      {
        path: 'subscription-tiffin-management',
        loadChildren: () => import('./pages/vendor/vendor-tiffin-subscription/routes').then((m) => m.VendorTiffinSubscriptionRoutes)
      },
      {
        path: 'waiter-management',
        loadChildren: () => import('./pages/vendor/vendor-waiter-management/routes').then((m) => m.VendorWaiterManagementRoutes)
      },
      {
        path: 'kitchen-owner-management',
        loadChildren: () => import('./pages/vendor/vendor-kitchen-management/routes').then((m) => m.VendorKitchenManagementRoutes)
      },
      {
        path: 'profile-management',
        loadChildren: () => import('./pages/vendor/vendor-profile-management/routes').then((m) => m.VendorProfileManagementRoutes)
      }
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () => import('./pages/authentication/authentication.routes').then((m) => m.AuthenticationRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
