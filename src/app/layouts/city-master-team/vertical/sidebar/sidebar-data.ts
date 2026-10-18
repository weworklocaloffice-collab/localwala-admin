import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/cityzen-team',
    isPrivate: false,
    key: 'dashboard'
  },
  {
    displayName: 'pos',
    iconName: 'tablerApps',
    route: '/cityzen-team/pos',
    isPrivate: false,
    key: 'pos'
  },
  {
    navCap: 'restaurant_management',
  },
  {
    displayName: 'localities',
    iconName: 'tablerMapPin',
    route: '/cityzen-team/localities',
    isPrivate: false,
    key: 'localities'
  },
  {
    displayName: 'restaurants',
    iconName: 'tablerBuildingStore',
    route: 'cityzen-team/restaurant-section',
    isPrivate: false,
    key: 'restaurant-section',
    children: [
      {
        displayName: 'restaurant_list',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/restaurants'
      },
      {
        displayName: 'outlet_list',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/outlets'
      },
      {
        displayName: 'restaurant_waiter',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/restaurant-waiters'
      },
      {
        displayName: 'restaurant_kitchen_owner',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/restaurant-kitchen-owner-list',
      },
      {
        displayName: 'new_request',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/restaurant-joining-request',
      },
      {
        displayName: 'filter_restaurants',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/filter-restaurants'
      },
      {
        displayName: 'report_issue',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/restaurant-report-issue',
      },
      {
        displayName: 'hidden_restaurants',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/restaurant-section/hidden-restaurants'
      },
    ]
  },
  {
    navCap: 'delivery_management'
  },
  {
    displayName: 'deliveryman',
    iconName: 'tablerMoped',
    route: 'cityzen-team/deliveryman-list',
    isPrivate: false,
    key: 'deliveryman-deliveryman-list'
  },
  {
    displayName: 'new_request',
    iconName: 'tablerBrowserPlus',
    route: 'cityzen-team/deliveryman-joining-request'
  },
  {
    navCap: 'order_management',
  },
  {
    displayName: 'order_list',
    iconName: 'tablerShoppingCartBolt',
    route: 'cityzen-team/regular-order-list',
  },
  {
    displayName: 'un_assigned_orders',
    iconName: 'tablerScooterElectric',
    route: 'cityzen-team/un-assigned-orders-list',
  },
  {
    displayName: 'pos_orders',
    iconName: 'tablerBrandMiniprogram',
    route: 'cityzen-team/pos-order-list',
  },
  {
    displayName: 'table_orders',
    iconName: 'tablerGridScan',
    route: 'cityzen-team/table-order-list',
  },
  {
    displayName: 'tiffin_packages',
    iconName: 'tablerPaperBag',
    route: 'cityzen-team/subscription-tiffin-package',
  },
  {
    displayName: 'subscription_orders',
    iconName: 'tablerCalendarRepeat',
    route: 'cityzen-team/subscription-tiffin-orders',
  },
  {
    displayName: 'refund_request',
    iconName: 'tablerReceiptRefund',
    route: 'cityzen-team/refund-request',
  },
  {
    displayName: 'order_complaints',
    iconName: 'tablerMoodSad',
    route: 'cityzen-team/order-complaints',
  },
  {
    displayName: 'dining_booking_list',
    iconName: 'tablerBrandAirtable',
    route: 'cityzen-team/dining-booking-list',
  },
  {
    displayName: 'chat',
    iconName: 'tablerBrandHipchat',
    route: '/cityzen-team/chat-list'
  },
  {
    navCap: 'food_management',
  },
  {
    displayName: 'foods',
    iconName: 'tablerToolsKitchen2',
    route: '/cityzen-team/food-list',
  },
  {
    displayName: 'addons',
    iconName: 'tablerPepper',
    route: '/cityzen-team/addon-list',
  },
  {
    displayName: 'food_taxation',
    iconName: 'tablerPercentage',
    route: '/cityzen-team/taxation-list',
  },
  {
    navCap: 'promo_management',
  },
  {
    displayName: 'campaigns',
    iconName: 'tablerSpeakerphone',
    route: 'cityzen-team/campaign-section',
    children: [
      {
        displayName: 'restaurant_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/campaign-section/restaurant-campaign'
      },
      {
        displayName: 'dining_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/campaign-section/dining-campaign'
      },
      {
        displayName: 'food_campaign',
        iconName: 'tablerCornerDownRight',
        route: '/cityzen-team/campaign-section/food-campaign'
      },
    ]
  },
  {
    displayName: 'coupons',
    iconName: 'tablerTicket',
    route: '/cityzen-team/coupon-list'
  },
  {
    displayName: 'banners',
    iconName: 'tablerFlag3',
    route: '/cityzen-team/banner-list'
  },
  {
    displayName: 'media',
    iconName: 'tablerPhotoSearch',
    route: '/cityzen-team/media'
  },
  {
    displayName: 'notification',
    iconName: 'tablerBellRinging2',
    route: '/cityzen-team/notifications'
  },
  {
    navCap: 'transaction_management',
  },
  {
    displayName: 'collect_cash',
    iconName: 'tablerWallet',
    route: '/cityzen-team/collection-cash'
  },
  {
    displayName: 'restaurant_withdraws',
    iconName: 'tablerReceipt2',
    route: '/cityzen-team/restaurant-withdraws'
  },
  {
    displayName: 'deliveryman_withdraws',
    iconName: 'tablerBike',
    route: '/cityzen-team/deliveryman-withdraws'
  },
  {
    displayName: 'restaurant',
    iconName: 'tablerCurrencyMonero',
    route: '/cityzen-team/restaurant-disbursements'
  },
  {
    displayName: 'deliveryman',
    iconName: 'tablerCoinMonero',
    route: '/cityzen-team/deliveryman-disbursements'
  },
];
