import { Routes } from '@angular/router';
import { OrdersList } from './orders-list/orders-list';
import { UnAssignedOrdersList } from './un-assigned-orders-list/un-assigned-orders-list';
import { RefundManagement } from './refund-management/refund-management';
import { OrderComplaintRequest } from './order-complaint-request/order-complaint-request';
import { SubscriptionTiffinOrders } from './subscription-tiffin-orders/subscription-tiffin-orders';
import { OrderDetails } from './order-details/order-details';
import { OrderInvoice } from './order-invoice/order-invoice';
import { RefundRequestInfo } from './refund-management/order-refund-request/refund-request-info/refund-request-info';
import { AdminTiffinSubscriptionManagement } from './admin-tiffin-subscription-management/admin-tiffin-subscription-management';
import { ManageAdminTiffinSubscriptionPackage } from './admin-tiffin-subscription-management/admin-tiffin-subscription-package-list/manage-admin-tiffin-subscription-package/manage-admin-tiffin-subscription-package';
import { AdminUserPurchasedTiffinSubscriptionList } from './admin-tiffin-subscription-management/admin-tiffin-subscription-package-list/admin-user-purchased-tiffin-subscription-list/admin-user-purchased-tiffin-subscription-list';
import { AdminUserPurchasedTiffinSubscriptonInfo } from './admin-tiffin-subscription-management/admin-tiffin-subscription-package-list/admin-user-purchased-tiffin-subscription-list/admin-user-purchased-tiffin-subscripton-info/admin-user-purchased-tiffin-subscripton-info';
import { TiffinSubscriptionRefundRequestInfo } from './refund-management/tiffin-subscription-refund-request-list/tiffin-subscription-refund-request-info/tiffin-subscription-refund-request-info';
import { DiningBookingRefundRequestInfo } from './refund-management/dining-booking-refund-request-list/dining-booking-refund-request-info/dining-booking-refund-request-info';
import { DiningBookingList } from './dining-booking-list/dining-booking-list';
import { DiningBookingDetails } from './dining-booking-list/dining-booking-details/dining-booking-details';
import { VendorsPosOrderList } from './vendors-pos-order-list/vendors-pos-order-list';
import { VendorsPosOrderDetail } from './vendors-pos-order-list/vendors-pos-order-detail/vendors-pos-order-detail';
import { VendorsTableOrderList } from './vendors-table-order-list/vendors-table-order-list';
import { VendorsTableOrderDetail } from './vendors-table-order-list/vendors-table-order-detail/vendors-table-order-detail';
import { VendorsPosOrderInvoicePrint } from './vendors-pos-order-list/vendors-pos-order-invoice-print/vendors-pos-order-invoice-print';
import { VendorsTableOrderInvoicePrint } from './vendors-table-order-list/vendors-table-order-invoice-print/vendors-table-order-invoice-print';

export const OrderManagementRoutes: Routes = [
  {
    path: 'orders-list',
    component: OrdersList,
    data: {
      title: 'orders_management'
    }
  },
  {
    path: 'orders-list/:id',
    component: OrdersList,
    data: {
      title: 'orders_management'
    }
  },
  {
    path: 'un-assigned-orders-list',
    component: UnAssignedOrdersList,
    data: {
      title: 'un_assigned_orders_list'
    }
  },
  {
    path: 'refund-request',
    component: RefundManagement,
    data: {
      title: 'refund_request',
    }
  },
  {
    path: 'order-complaints',
    component: OrderComplaintRequest,
    data: {
      title: 'orders_complaints'
    }
  },
  {
    path: 'order-complaints/:id',
    component: OrderComplaintRequest,
    data: {
      title: 'orders_complaints'
    }
  },
  {
    path: 'subscription-tiffin-orders',
    component: SubscriptionTiffinOrders,
    data: {
      title: 'subscription_tiffin_orders'
    }
  },
  {
    path: 'order-details/:id',
    component: OrderDetails,
    data: {
      title: 'order_details'
    }
  },
  {
    path: 'order-invoice/:id',
    component: OrderInvoice,
    data: {
      title: 'order_invoice'
    }
  },
  {
    path: 'refund-request-info/:id',
    component: RefundRequestInfo,
    data: {
      title: 'refund_request_info',
    }
  },
  {
    path: 'subscription-tiffin-package',
    component: AdminTiffinSubscriptionManagement,
    data: {
      title: 'tiffin_subscription_packages',
    }
  },
  {
    path: 'add-subscription-tiffin-package',
    component: ManageAdminTiffinSubscriptionPackage,
    data: {
      title: 'add_tiffin_subscription_package',
    }
  },
  {
    path: 'manage-subscription-tiffin-package/:id/:restaurant',
    component: ManageAdminTiffinSubscriptionPackage,
    data: {
      title: 'manage_tiffin_subscription_package',
    }
  },
  {
    path: 'user-purchased-tiffin-subscription-list/:id',
    component: AdminUserPurchasedTiffinSubscriptionList,
    data: {
      title: 'user_purchased_tiffin_subscription_list'
    }
  },
  {
    path: 'user-purchased-tiffin-subscription-info/:id',
    component: AdminUserPurchasedTiffinSubscriptonInfo,
    data: {
      title: 'user_purchased_tiffin_subscription_info'
    }
  },
  {
    path: 'tiffin-subscription-refund-request/:id',
    component: TiffinSubscriptionRefundRequestInfo,
    data: {
      title: 'refund_request_tiffin_subscription'
    }
  },
  {
    path: 'dining-booking-refund-request/:id',
    component: DiningBookingRefundRequestInfo,
    data: {
      title: 'dining_refund_request'
    }
  },
  {
    path: 'dining-booking-list',
    component: DiningBookingList,
    data: {
      title: 'dining_booking_management'
    }
  },
  {
    path: 'dining-booking-details/:id',
    component: DiningBookingDetails,
    data: {
      title: 'dining_booking_detail'
    }
  },
  {
    path: 'vendors-pos-order-list',
    component: VendorsPosOrderList,
    data: {
      title: 'pos_orders'
    }
  },
  {
    path: 'vendors-pos-order-detail/:id',
    component: VendorsPosOrderDetail,
    data: {
      title: 'pos_order_detail'
    }
  },
  {
    path: 'vendors-table-order-list',
    component: VendorsTableOrderList,
    data: {
      title: 'table_orders'
    }
  },
  {
    path: 'vendors-table-order-detail/:id',
    component: VendorsTableOrderDetail,
    data: {
      title: 'table_order_detail'
    }
  },
  {
    path: 'vendors-pos-order-invoice/:id',
    component: VendorsPosOrderInvoicePrint,
    data: {
      title: 'pos_order_invoice'
    }
  },
  {
    path: 'vendors-table-order-invoice/:id',
    component: VendorsTableOrderInvoicePrint,
    data: {
      title: 'table_order_invoice'
    }
  }
];
