import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'home',
    isPrivate: false,
    key: 'home'
  },
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/vendor',
    isPrivate: false,
    key: 'dashboard'
  },
  {
    displayName: 'pos',
    iconName: 'tablerApps',
    route: '/vendor/pos',
    isPrivate: true,
    key: 'pos'
  },
  {
    displayName: 'order_list',
    iconName: 'tablerShoppingCartBolt',
    route: '/vendor/order-management/orders-list',
    isPrivate: false,
    key: 'orders'
  },
  {
    navCap: 'table_management',
    isPrivate: true,
    key: 'tableOrder'
  },
  {
    displayName: 'table_orders',
    iconName: 'tablerQrcode',
    route: 'vendor/table-management',
    isPrivate: true,
    key: 'tableOrder',
    children: [
      {
        displayName: 'orders',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/table-management/orders'
      },
      {
        displayName: 'table_list',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/table-management/table-qr-codes'
      }
    ]
  },
  {
    displayName: 'pre_table_booking',
    iconName: 'tablerCalendarEvent',
    route: '/vendor/table-prebooking/booking-list',
    isPrivate: true,
    key: 'preBooking'
  },
  {
    displayName: 'dining_settings',
    iconName: 'tablerSettingsCog',
    route: '/vendor/profile-management/vendor-dining-setting',
    isPrivate: true,
    key: 'preBooking'
  },
  {
    navCap: 'waiter_management',
    isPrivate: true,
    key: 'waiter'
  },
  {
    displayName: 'waiter_list',
    iconName: 'tablerUserEdit',
    route: '/vendor/waiter-management/list',
    isPrivate: true,
    key: 'waiter'
  },
  {
    navCap: 'kitchen_management',
    isPrivate: true,
    key: 'kitchen'
  },
  {
    displayName: 'kitchen_owner',
    iconName: 'tablerChefHat',
    route: '/vendor/kitchen-owner-management/list',
    isPrivate: true,
    key: 'kitchen'
  },
  {
    navCap: 'outlet_management',
    isPrivate: true,
    key: 'multiOutlet'
  },
  {
    displayName: 'outlets',
    iconName: 'tablerTournament',
    route: '/vendor/outlet-management/list',
    isPrivate: true,
    key: 'multiOutlet'
  },
  {
    navCap: 'deliveryman_management',
    isPrivate: true,
    key: 'ownDriver',
  },
  {
    displayName: 'deliveryman_list',
    iconName: 'tablerRun',
    route: '/vendor/driver-management/list',
    isPrivate: true,
    key: 'ownDriver'
  },
  {
    navCap: 'promo_management',
    isPrivate: false,
    key: 'promocode',
  },
  {
    displayName: 'campaigns',
    iconName: 'tablerSpeakerphone',
    route: 'vendor/promotion-management',
    isPrivate: false,
    key: 'promocode',
    children: [
      {
        displayName: 'restaurant_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/promotion-management/restaurant-campaign'
      },
      {
        displayName: 'dining_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/promotion-management/dining-campaign'
      },
      {
        displayName: 'food_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/promotion-management/food-campaign'
      }
    ]
  },
  {
    displayName: 'coupons',
    iconName: 'tablerDiscount',
    route: '/vendor/coupon-management/coupons',
    isPrivate: false,
    key: 'promocode',
  },
  {
    navCap: 'food_management',
    isPrivate: false,
    key: 'foods',
  },
  {
    displayName: 'categories',
    iconName: 'tablerCategory',
    route: 'vendor/categories-management',
    isPrivate: false,
    key: 'foods',
    children: [
      {
        displayName: 'category',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/categories-management/categories'
      },
      {
        displayName: 'sub_category',
        iconName: 'tablerCornerDownRight',
        route: '/vendor/categories-management/sub-categories'
      },
    ]
  },
  {
    displayName: 'foods',
    iconName: 'tablerToolsKitchen2',
    route: '/vendor/food-management/food-list',
    isPrivate: false,
    key: 'foods',
  },
  {
    displayName: 'addons',
    iconName: 'tablerPepper',
    route: '/vendor/addon-management/addons',
    isPrivate: false,
    key: 'foods',
  },
  {
    navCap: 'tiffin_packages',
    isPrivate: true,
    key: 'tiffin',
  },
  {
    displayName: 'packages',
    iconName: 'tablerPaperBag',
    route: '/vendor/subscription-tiffin-management/list',
    isPrivate: true,
    key: 'tiffin',
  },
  {
    navCap: 'profile_management',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'edit_restaurant',
    iconName: 'tablerEdit',
    route: '/vendor/profile-management/edit-vendor-detail',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'schedule_timing',
    iconName: 'tablerClock24',
    route: '/vendor/profile-management/edit-schedule-time',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'menu_photos',
    iconName: 'tablerLayoutSidebarRightCollapse',
    route: '/vendor/profile-management/edit-menu-photos',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'food_taxation',
    iconName: 'tablerReceiptTax',
    route: '/vendor/profile-management/vendor-taxation-list',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'review_list',
    iconName: 'tablerStars',
    route: '/vendor/profile-management/vendor-review-list',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'chat_messages',
    iconName: 'tablerMessage',
    route: '/vendor/profile-management/vendor-chat-list',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'wallet',
    iconName: 'tablerWallet',
    route: '/vendor/profile-management/vendor-wallet-account',
    isPrivate: false,
    key: 'profile',
  },
  {
    displayName: 'expense_report',
    iconName: 'tablerMessageDollar',
    route: '/vendor/profile-management/vendor-expense-report',
    isPrivate: false,
    key: 'profile',
  },
];
