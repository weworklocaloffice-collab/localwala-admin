import { Routes } from '@angular/router';
import { CityzenDashboard } from './cityzen-dashboard/cityzen-dashboard';
import { CityzenPosSection } from './cityzen-pos-section/cityzen-pos-section';
import { CityzenLocalities } from './cityzen-restaurants/cityzen-localities/cityzen-localities';
import { CityzenRestaurants } from './cityzen-restaurants/cityzen-restaurants';
import { CityzenManageRestaurant } from './cityzen-restaurants/cityzen-manage-restaurant/cityzen-manage-restaurant';
import { CityzenOutlets } from './cityzen-restaurants/cityzen-outlets/cityzen-outlets';
import { CityzenJoiningRequest } from './cityzen-restaurants/cityzen-joining-request/cityzen-joining-request';
import { CityzenJoiningRequestDetail } from './cityzen-restaurants/cityzen-joining-request/cityzen-joining-request-detail/cityzen-joining-request-detail';
import { CityzenFilterRestaurants } from './cityzen-restaurants/cityzen-filter-restaurants/cityzen-filter-restaurants';
import { CityzenRestaurantWaiter } from './cityzen-restaurants/cityzen-restaurant-waiter/cityzen-restaurant-waiter';
import { DialogCityzenRestaurantWaiter } from './cityzen-restaurants/cityzen-restaurant-waiter/dialog-cityzen-restaurant-waiter/dialog-cityzen-restaurant-waiter';
import { CityzenRestaurantKitchenOwnerList } from './cityzen-restaurants/cityzen-restaurant-kitchen-owner-list/cityzen-restaurant-kitchen-owner-list';
import { DialogCityzenRestaurantKitchenOwner } from './cityzen-restaurants/cityzen-restaurant-kitchen-owner-list/dialog-cityzen-restaurant-kitchen-owner/dialog-cityzen-restaurant-kitchen-owner';
import { CityzenRestaurantReportIssueList } from './cityzen-restaurants/cityzen-restaurant-report-issue-list/cityzen-restaurant-report-issue-list';
import { CityzenHiddenRestaurantList } from './cityzen-restaurants/cityzen-hidden-restaurant-list/cityzen-hidden-restaurant-list';
import { CityzenDeliverymanSection } from './cityzen-deliveryman-section/cityzen-deliveryman-section';
import { CityzenDeliverymanNewRequest } from './cityzen-deliveryman-section/cityzen-deliveryman-new-request/cityzen-deliveryman-new-request';
import { CityzenRestaurantDetail } from './cityzen-restaurants/cityzen-restaurant-detail/cityzen-restaurant-detail';
import { CityzenManageDeliverymanDetail } from './cityzen-deliveryman-section/cityzen-manage-deliveryman-detail/cityzen-manage-deliveryman-detail';
import { CityzenDeliverymanDetail } from './cityzen-deliveryman-section/cityzen-deliveryman-detail/cityzen-deliveryman-detail';
import { CityzenDeliverymanRequestDetail } from './cityzen-deliveryman-section/cityzen-deliveryman-new-request/cityzen-deliveryman-request-detail/cityzen-deliveryman-request-detail';
import { CityzenOrderSection } from './cityzen-order-section/cityzen-order-section';
import { CityzenOrderDetail } from './cityzen-order-section/cityzen-order-list/cityzen-order-detail/cityzen-order-detail';
import { CityzenOrderInvoice } from './cityzen-order-section/cityzen-order-list/cityzen-order-invoice/cityzen-order-invoice';
import { CityzenCustomerSection } from './cityzen-customer-section/cityzen-customer-section';
import { CityzenUnAssignedOrderList } from './cityzen-order-section/cityzen-order-list/cityzen-un-assigned-order-list/cityzen-un-assigned-order-list';
import { CityzenPosOrderList } from './cityzen-order-section/cityzen-pos-order-list/cityzen-pos-order-list';
import { CityzenPosOrderDetail } from './cityzen-order-section/cityzen-pos-order-list/cityzen-pos-order-detail/cityzen-pos-order-detail';
import { CityzenPosOrderInvoice } from './cityzen-order-section/cityzen-pos-order-list/cityzen-pos-order-invoice/cityzen-pos-order-invoice';
import { CityzenTableOrderList } from './cityzen-order-section/cityzen-table-order-list/cityzen-table-order-list';
import { CityzenTableOrderDetail } from './cityzen-order-section/cityzen-table-order-list/cityzen-table-order-detail/cityzen-table-order-detail';
import { CityzenTableOrderInvoice } from './cityzen-order-section/cityzen-table-order-list/cityzen-table-order-invoice/cityzen-table-order-invoice';
import { CityzenFoodSection } from './cityzen-food-section/cityzen-food-section';
import { CityzenManageFood } from './cityzen-food-section/cityzen-manage-food/cityzen-manage-food';
import { CityzenFoodDetail } from './cityzen-food-section/cityzen-food-detail/cityzen-food-detail';
import { CityzenAddonsList } from './cityzen-food-section/cityzen-addons-list/cityzen-addons-list';
import { CityzenFoodTaxationList } from './cityzen-food-section/cityzen-food-taxation-list/cityzen-food-taxation-list';
import { CityzenTiffinSubscriptionPackageList } from './cityzen-order-section/cityzen-tiffin-subscription-package-list/cityzen-tiffin-subscription-package-list';
import { CityzenManageTiffinSubscriptionPackage } from './cityzen-order-section/cityzen-tiffin-subscription-package-list/cityzen-manage-tiffin-subscription-package/cityzen-manage-tiffin-subscription-package';
import { CityzenUserPurchasedTiffinSubscriptionList } from './cityzen-order-section/cityzen-tiffin-subscription-package-list/cityzen-user-purchased-tiffin-subscription-list/cityzen-user-purchased-tiffin-subscription-list';
import { CityzenUserPurchasedTiffinSubscriptionInfo } from './cityzen-order-section/cityzen-tiffin-subscription-package-list/cityzen-user-purchased-tiffin-subscription-list/cityzen-user-purchased-tiffin-subscription-info/cityzen-user-purchased-tiffin-subscription-info';
import { CityzenSubscriptionTiffinOrders } from './cityzen-order-section/cityzen-subscription-tiffin-orders/cityzen-subscription-tiffin-orders';
import { CityzenRefundRequestSection } from './cityzen-order-section/cityzen-refund-request-section/cityzen-refund-request-section';
import { CityzenOrderRefundRequestInfo } from './cityzen-order-section/cityzen-refund-request-section/cityzen-order-refund-request/cityzen-order-refund-request-info/cityzen-order-refund-request-info';
import { CityzenTiffinSubscriptionRefundRequestDetail } from './cityzen-order-section/cityzen-refund-request-section/cityzen-tiffin-subscription-refund-request/cityzen-tiffin-subscription-refund-request-detail/cityzen-tiffin-subscription-refund-request-detail';
import { CityzenDiningBookingRefundRequestDetail } from './cityzen-order-section/cityzen-refund-request-section/cityzen-dining-booking-refund-request/cityzen-dining-booking-refund-request-detail/cityzen-dining-booking-refund-request-detail';
import { CityzenComplaintsSection } from './cityzen-order-section/cityzen-complaints-section/cityzen-complaints-section';
import { CityzenDiningBookingSection } from './cityzen-order-section/cityzen-dining-booking-section/cityzen-dining-booking-section';
import { CityzenDiningBookingDetail } from './cityzen-order-section/cityzen-dining-booking-section/cityzen-dining-booking-list/cityzen-dining-booking-detail/cityzen-dining-booking-detail';
import { CityzenRestaurantCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-restaurant-campaign/cityzen-restaurant-campaign';
import { CityzenDiningCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-dining-campaign/cityzen-dining-campaign';
import { CityzenFoodCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-food-campaign/cityzen-food-campaign';
import { CityzenCouponSection } from './cityzen-promotion-management/cityzen-coupon-section/cityzen-coupon-section';
import { CityzenBanners } from './cityzen-promotion-management/cityzen-banners/cityzen-banners';
import { CityzenMediaFiles } from './cityzen-promotion-management/cityzen-media-files/cityzen-media-files';
import { CityzenNotificationWidget } from './cityzen-promotion-management/cityzen-notification-widget/cityzen-notification-widget';
import { CityzenManageRestaurantCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-restaurant-campaign/cityzen-manage-restaurant-campaign/cityzen-manage-restaurant-campaign';
import { CityzenRestaurantCampaignDetail } from './cityzen-promotion-management/cityzen-campaign/cityzen-restaurant-campaign/cityzen-restaurant-campaign-detail/cityzen-restaurant-campaign-detail';
import { CityzenManageDiningCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-dining-campaign/cityzen-manage-dining-campaign/cityzen-manage-dining-campaign';
import { CityzenDiningCampaignDetail } from './cityzen-promotion-management/cityzen-campaign/cityzen-dining-campaign/cityzen-dining-campaign-detail/cityzen-dining-campaign-detail';
import { CityzenManageFoodCampaign } from './cityzen-promotion-management/cityzen-campaign/cityzen-food-campaign/cityzen-manage-food-campaign/cityzen-manage-food-campaign';
import { CityzenFoodCampaignDetail } from './cityzen-promotion-management/cityzen-campaign/cityzen-food-campaign/cityzen-food-campaign-detail/cityzen-food-campaign-detail';
import { CityzenManageCoupon } from './cityzen-promotion-management/cityzen-coupon-section/cityzen-coupon-list/cityzen-manage-coupon/cityzen-manage-coupon';
import { CityzenCouponRedeemedOrders } from './cityzen-promotion-management/cityzen-coupon-section/cityzen-coupon-list/cityzen-coupon-redeemed-orders/cityzen-coupon-redeemed-orders';
import { CityzenManageDiningCoupon } from './cityzen-promotion-management/cityzen-coupon-section/cityzen-dining-coupon-list/cityzen-manage-dining-coupon/cityzen-manage-dining-coupon';
import { CityzenDiningCouponRedeemedBookings } from './cityzen-promotion-management/cityzen-coupon-section/cityzen-dining-coupon-list/cityzen-dining-coupon-redeemed-bookings/cityzen-dining-coupon-redeemed-bookings';
import { CityzenCollectCash } from './cityzen-transaction/cityzen-collect-cash/cityzen-collect-cash';
import { CityzenRestaurantWithdrawalRequest } from './cityzen-transaction/cityzen-restaurant-withdrawal-request/cityzen-restaurant-withdrawal-request';
import { CityzenDeliverymanWithdrawalRequest } from './cityzen-transaction/cityzen-deliveryman-withdrawal-request/cityzen-deliveryman-withdrawal-request';
import { CityzenRestaurantDisbursementList } from './cityzen-transaction/cityzen-restaurant-disbursement-list/cityzen-restaurant-disbursement-list';
import { CityzenDeliverymanDisbursementList } from './cityzen-transaction/cityzen-deliveryman-disbursement-list/cityzen-deliveryman-disbursement-list';
import { CityzenWithdrawalRequestDetail } from './cityzen-transaction/cityzen-withdrawal-request-detail/cityzen-withdrawal-request-detail';
import { CityzenProfileSetting } from './cityzen-profile-setting/cityzen-profile-setting';
import { CityzenChatWidget } from './cityzen-chat-widget/cityzen-chat-widget';
import { CityzenNotificationList } from './cityzen-notification-list/cityzen-notification-list';

export const CityMasterManagementRoutes: Routes = [
  {
    path: '',
    component: CityzenDashboard,
    data: {
      title: 'dashboard'
    }
  },
  {
    path: 'pos',
    component: CityzenPosSection,
    data: {
      title: 'pos_orders'
    }
  },
  {
    path: 'localities',
    component: CityzenLocalities,
    data: {
      title: 'localities'
    }
  },
  {
    path: 'restaurants',
    component: CityzenRestaurants,
    data: {
      title: 'restaurants'
    }
  },
  {
    path: 'add-restaurant',
    component: CityzenManageRestaurant,
    data: {
      title: 'add_restaurant'
    }
  },
  {
    path: 'edit-restaurant/:id',
    component: CityzenManageRestaurant,
    data: {
      title: 'update_restaurant'
    }
  },
  {
    path: 'outlets',
    component: CityzenOutlets,
    data: {
      title: 'outlets'
    }
  },
  {
    path: 'restaurant-joining-request',
    component: CityzenJoiningRequest,
    data: {
      title: 'restaurant_joining_request'
    }
  },
  {
    path: 'restaurant-joining-request-detail/:id',
    component: CityzenJoiningRequestDetail,
    data: {
      title: 'restaurant_joining_request_detail'
    }
  },
  {
    path: 'filter-restaurants',
    component: CityzenFilterRestaurants,
    data: {
      title: 'filter_restaurants'
    }
  },
  {
    path: 'restaurant-waiters',
    component: CityzenRestaurantWaiter,
    data: {
      title: 'restaurant_waiter'
    }
  },
  {
    path: 'edit-restaurant-waiter/:id',
    component: DialogCityzenRestaurantWaiter,
    data: {
      title: 'update_waiter'
    }
  },
  {
    path: 'restaurant-kitchen-owner-list',
    component: CityzenRestaurantKitchenOwnerList,
    data: {
      title: 'restaurant_kitchen_owner'
    }
  },
  {
    path: 'edit-restaurant-kitchen-owner/:id',
    component: DialogCityzenRestaurantKitchenOwner,
    data: {
      title: 'update_kitchen_owner'
    }
  },
  {
    path: 'restaurant-report-issue',
    component: CityzenRestaurantReportIssueList,
    data: {
      title: 'report_issue_restaurants'
    }
  },
  {
    path: 'hidden-restaurants',
    component: CityzenHiddenRestaurantList,
    data: {
      title: 'hidden_restaurants'
    }
  },
  {
    path: 'deliveryman-list',
    component: CityzenDeliverymanSection,
    data: {
      title: 'deliveryman_list'
    }
  },
  {
    path: 'deliveryman-joining-request',
    component: CityzenDeliverymanNewRequest,
    data: {
      title: 'deliveryman_joining_request'
    }
  },
  {
    path: 'restaurant-detail/:id',
    component: CityzenRestaurantDetail,
    data: {
      title: 'restaurant_detail'
    }
  },
  {
    path: 'add-driver',
    component: CityzenManageDeliverymanDetail,
    data: {
      title: 'add_delivery_partner'
    }
  },
  {
    path: 'manage-driver/:id',
    component: CityzenManageDeliverymanDetail,
    data: {
      title: 'update_delivery_partner'
    }
  },
  {
    path: 'deliveryman-details/:id',
    component: CityzenDeliverymanDetail,
    data: {
      title: 'deliveryman_details'
    }
  },
  {
    path: 'deliveryman-joining-request-detail/:id',
    component: CityzenDeliverymanRequestDetail,
    data: {
      title: 'deliveryman_joining_request_detail'
    }
  },
  {
    path: 'regular-order-list',
    component: CityzenOrderSection,
    data: {
      title: 'orders'
    }
  },
  {
    path: 'order-details/:id',
    component: CityzenOrderDetail,
    data: {
      title: 'order_details'
    }
  },
  {
    path: 'order-invoice/:id',
    component: CityzenOrderInvoice,
    data: {
      title: 'order_invoice'
    }
  },
  {
    path: 'customer-detail/:id',
    component: CityzenCustomerSection,
    data: {
      title: 'customer_details'
    }
  },
  {
    path: 'un-assigned-orders-list',
    component: CityzenUnAssignedOrderList,
    data: {
      title: 'un_assigned_orders_list'
    }
  },
  {
    path: 'pos-order-list',
    component: CityzenPosOrderList,
    data: {
      title: 'pos_orders'
    }
  },
  {
    path: 'pos-order-detail/:id',
    component: CityzenPosOrderDetail,
    data: {
      title: 'pos_order_detail'
    }
  },
  {
    path: 'pos-order-invoice/:id',
    component: CityzenPosOrderInvoice,
    data: {
      title: 'pos_order_invoice'
    }
  },
  {
    path: 'table-order-list',
    component: CityzenTableOrderList,
    data: {
      title: 'table_orders'
    }
  },
  {
    path: 'table-order-detail/:id',
    component: CityzenTableOrderDetail,
    data: {
      title: 'table_order_detail'
    }
  },
  {
    path: 'table-order-invoice/:id',
    component: CityzenTableOrderInvoice,
    data: {
      title: 'table_order_invoice'
    }
  },
  {
    path: 'food-list',
    component: CityzenFoodSection,
    data: {
      title: 'food_list'
    }
  },
  {
    path: 'add-food',
    component: CityzenManageFood,
    data: {
      title: 'add_food'
    }
  },
  {
    path: 'edit-food/:id',
    component: CityzenManageFood,
    data: {
      title: 'update_food'
    }
  },
  {
    path: 'food-detail/:id',
    component: CityzenFoodDetail,
    data: {
      title: 'food_detail'
    }
  },
  {
    path: 'addon-list',
    component: CityzenAddonsList,
    data: {
      title: 'addon_list'
    }
  },
  {
    path: 'taxation-list',
    component: CityzenFoodTaxationList,
    data: {
      title: 'food_taxation_list'
    }
  },
  {
    path: 'subscription-tiffin-package',
    component: CityzenTiffinSubscriptionPackageList,
    data: {
      title: 'tiffin_subscription_packages'
    }
  },
  {
    path: 'add-subscription-tiffin-package',
    component: CityzenManageTiffinSubscriptionPackage,
    data: {
      title: 'add_tiffin_subscription_package'
    }
  },
  {
    path: 'manage-subscription-tiffin-package/:id/:restaurant',
    component: CityzenManageTiffinSubscriptionPackage,
    data: {
      title: 'manage_tiffin_subscription_package'
    }
  },
  {
    path: 'user-purchased-tiffin-subscription-list/:id',
    component: CityzenUserPurchasedTiffinSubscriptionList,
    data: {
      title: 'user_purchased_tiffin_subscription_list'
    }
  },
  {
    path: 'user-purchased-tiffin-subscription-info/:id',
    component: CityzenUserPurchasedTiffinSubscriptionInfo,
    data: {
      title: 'user_purchased_tiffin_subscription_info'
    }
  },
  {
    path: 'subscription-tiffin-orders',
    component: CityzenSubscriptionTiffinOrders,
    data: {
      title: 'subscription_tiffin_orders'
    }
  },
  {
    path: 'refund-request',
    component: CityzenRefundRequestSection,
    data: {
      title: 'refund_request'
    }
  },
  {
    path: 'refund-request-info/:id',
    component: CityzenOrderRefundRequestInfo,
    data: {
      title: 'order_refund_request_info'
    }
  },
  {
    path: 'tiffin-subscription-refund-request/:id',
    component: CityzenTiffinSubscriptionRefundRequestDetail,
    data: {
      title: 'tiffin_subscription_refund_request_info'
    }
  },
  {
    path: 'dining-booking-refund-request/:id',
    component: CityzenDiningBookingRefundRequestDetail,
    data: {
      title: 'dining_booking_refund_request_info'
    }
  },
  {
    path: 'order-complaints',
    component: CityzenComplaintsSection,
    data: {
      title: 'orders_complaints'
    }
  },
  {
    path: 'dining-booking-list',
    component: CityzenDiningBookingSection,
    data: {
      title: 'th_dining_booking'
    }
  },
  {
    path: 'dining-booking-details/:id',
    component: CityzenDiningBookingDetail,
    data: {
      title: 'dining_booking_detail'
    }
  },
  {
    path: 'restaurant-campaign',
    component: CityzenRestaurantCampaign,
    data: {
      title: 'restaurant_campaign'
    }
  },
  {
    path: 'dining-campaign',
    component: CityzenDiningCampaign,
    data: {
      title: 'dining_campaign'
    }
  },
  {
    path: 'food-campaign',
    component: CityzenFoodCampaign,
    data: {
      title: 'food_campaign'
    }
  },
  {
    path: 'coupon-list',
    component: CityzenCouponSection,
    data: {
      title: 'coupon_management'
    }
  },
  {
    path: 'banner-list',
    component: CityzenBanners,
    data: {
      title: 'banner_list'
    }
  },
  {
    path: 'media',
    component: CityzenMediaFiles,
    data: {
      title: 'th_media_files'
    }
  },
  {
    path: 'notifications',
    component: CityzenNotificationWidget,
    data: {
      title: 'notifications'
    }
  },
  {
    path: 'add-restaurant-campaign',
    component: CityzenManageRestaurantCampaign,
    data: {
      title: 'add_restaurant_campaign'
    }
  },
  {
    path: 'manage-restaurant-campaign/:id',
    component: CityzenManageRestaurantCampaign,
    data: {
      title: 'manage_restaurant_campaign'
    }
  },
  {
    path: 'restaurant-campaign-detail/:id',
    component: CityzenRestaurantCampaignDetail,
    data: {
      title: 'restaurant_campaign_detail'
    }
  },
  {
    path: 'add-dining-campaign',
    component: CityzenManageDiningCampaign,
    data: {
      title: 'add_dining_campaign'
    }
  },
  {
    path: 'manage-dining-campaign/:id',
    component: CityzenManageDiningCampaign,
    data: {
      title: 'update_dining_campaign'
    }
  },
  {
    path: 'dining-campaign-detail/:id',
    component: CityzenDiningCampaignDetail,
    data: {
      title: 'dining_campaign_detail'
    }
  },
  {
    path: 'add-food-campaign',
    component: CityzenManageFoodCampaign,
    data: {
      title: 'add_food_campaign'
    }
  },
  {
    path: 'manage-food-campaign/:id',
    component: CityzenManageFoodCampaign,
    data: {
      title: 'update_food_campaign'
    }
  },
  {
    path: 'food-campaign-detail/:id',
    component: CityzenFoodCampaignDetail,
    data: {
      title: 'food_campaign_detail'
    }
  },
  {
    path: 'add-coupon',
    component: CityzenManageCoupon,
    data: {
      title: 'add_coupon'
    }
  },
  {
    path: 'edit-coupon/:id',
    component: CityzenManageCoupon,
    data: {
      title: 'update_coupon'
    }
  },
  {
    path: 'coupon-redeem-orders/:id',
    component: CityzenCouponRedeemedOrders,
    data: {
      title: 'coupon_orders'
    }
  },
  {
    path: 'add-dining-coupon',
    component: CityzenManageDiningCoupon,
    data: {
      title: 'add_dining_coupon'
    }
  },
  {
    path: 'edit-dining-coupon/:id',
    component: CityzenManageDiningCoupon,
    data: {
      title: 'update_dining_coupon'
    }
  },
  {
    path: 'dining-coupon-redeem-booking/:id',
    component: CityzenDiningCouponRedeemedBookings,
    data: {
      title: 'coupon_orders'
    }
  },
  {
    path: 'collection-cash',
    component: CityzenCollectCash,
    data: {
      title: 'collect_cash'
    }
  },
  {
    path: 'restaurant-withdraws',
    component: CityzenRestaurantWithdrawalRequest,
    data: {
      title: 'restaurant_withdrawal_request'
    }
  },
  {
    path: 'deliveryman-withdraws',
    component: CityzenDeliverymanWithdrawalRequest,
    data: {
      title: 'deliveryman_withdrawal_request'
    }
  },
  {
    path: 'restaurant-disbursements',
    component: CityzenRestaurantDisbursementList,
    data: {
      title: 'restaurant_disbursement'
    }
  },
  {
    path: 'deliveryman-disbursements',
    component: CityzenDeliverymanDisbursementList,
    data: {
      title: 'deliveryman_disbursement'
    }
  },
  {
    path: 'withdrawal-request-detail/:id',
    component: CityzenWithdrawalRequestDetail,
    data: {
      title: 'withdrawal_request_detail'
    }
  },
  {
    path: 'profile-setting',
    component: CityzenProfileSetting,
    data: {
      title: 'profile_setting'
    }
  },
  {
    path: 'chat-list',
    component: CityzenChatWidget,
    data: {
      title: 'chat_list'
    }
  },
  {
    path: 'notification-list',
    component: CityzenNotificationList,
    data: {
      title: 'notifications'
    }
  }
];
