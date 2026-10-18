import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/accountant-team',
    isPrivate: false,
    key: 'dashboard'
  },
  {
    navCap: 'transaction_management',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'collect_cash',
    iconName: 'tablerWallet',
    route: '/accountant-team/u/collect-cash',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'restaurant_withdraws',
    iconName: 'tablerReceipt2',
    route: '/accountant-team/u/restaurant-withdrawal-request',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'deliveryman_withdraws',
    iconName: 'tablerBike',
    route: '/accountant-team/u/deliveryman-withdrawal-request',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'withdrawal_methods',
    iconName: 'tablerPigMoney',
    route: '/accountant-team/u/withdrawal-methods',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'disbursements',
    iconName: 'tablerAdjustmentsDollar',
    route: 'accountant-team/disbursement',
    isPrivate: false,
    key: 'transaction',
    children: [
      {
        displayName: 'restaurant',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/disbursement/restaurant-disbursement-list'
      },
      {
        displayName: 'deliveryman',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/disbursement/deliveryman-disbursement-list'
      },
    ]
  },
  {
    navCap: 'report_management',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'expense_report',
    iconName: 'tablerMessageDollar',
    route: '/accountant-team/u/expense-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'order_report',
    iconName: 'tablerClipboardText',
    route: 'accountant-team/order-reports',
    isPrivate: false,
    key: 'transaction',
    children: [
      {
        displayName: 'regular_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/order-reports/regular-order-report'
      },
      {
        displayName: 'pos_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/order-reports/pos-order-report'
      },
      {
        displayName: 'table_order_report',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/order-reports/table-order-report'
      },
    ]
  },
  {
    displayName: 'wallet_report',
    iconName: 'tablerWallpaper',
    route: '/accountant-team/u/wallet-transaction',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'payment_report',
    iconName: 'tablerMicrowave',
    route: '/accountant-team/u/payment-transaction-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'dining_booking_report',
    iconName: 'tablerMichelinStarGreen',
    route: '/accountant-team/u/dining-booking-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'food_report',
    iconName: 'tablerBurger',
    route: '/accountant-team/u/food-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'restaurant_report',
    iconName: 'tablerBuildingBank',
    route: '/accountant-team/u/restaurant-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'customer_report',
    iconName: 'tablerUserScan',
    route: '/accountant-team/u/customer-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'deliveryman_report',
    iconName: 'tablerMoped',
    route: '/accountant-team/u/deliveryman-report',
    isPrivate: false,
    key: 'transaction'
  },
  {
    displayName: 'disbursement_report',
    iconName: 'tablerCashBanknote',
    route: 'accountant-team/disbursement-reports',
    isPrivate: false,
    key: 'transaction',
    children: [
      {
        displayName: 'restaurant',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/disbursement-reports/restaurant-disbursement-report'
      },
      {
        displayName: 'deliveryman',
        iconName: 'tablerCornerDownRight',
        route: '/accountant-team/disbursement-reports/deliveryman-disbursement-report'
      },
    ]
  },
];
