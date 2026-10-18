import { Routes } from '@angular/router';
import { RestaurantCampaign } from './campaign/restaurant-campaign/restaurant-campaign';
import { ManageRestaurantCampaign } from './campaign/restaurant-campaign/manage-restaurant-campaign/manage-restaurant-campaign';
import { DiningCampaign } from './campaign/dining-campaign/dining-campaign';
import { ManageDiningCampaign } from './campaign/dining-campaign/manage-dining-campaign/manage-dining-campaign';
import { FoodCampaign } from './campaign/food-campaign/food-campaign';
import { ManageFoodCampaign } from './campaign/food-campaign/manage-food-campaign/manage-food-campaign';
import { Banners } from './banners/banners';
import { DialogManageCoupon } from './coupons/dialog-manage-coupon/dialog-manage-coupon';
import { DialogManageDiningCoupon } from './coupons/dialog-manage-dining-coupon/dialog-manage-dining-coupon';
import { RestaurantCampaignDetail } from './campaign/restaurant-campaign/restaurant-campaign-detail/restaurant-campaign-detail';
import { FoodCampaignDetail } from './campaign/food-campaign/food-campaign-detail/food-campaign-detail';
import { DiningCampaignDetail } from './campaign/dining-campaign/dining-campaign-detail/dining-campaign-detail';
import { CouponRedeemedOrders } from './coupons/coupon-list/coupon-redeemed-orders/coupon-redeemed-orders';
import { DiningCouponRedeemedBookings } from './coupons/dining-coupon-list/dining-coupon-redeemed-bookings/dining-coupon-redeemed-bookings';
import { Notifications } from './notifications/notifications';
import { Coupons } from './coupons/coupons';
import { HeaderBanner } from './header-banner/header-banner';

export const PromotionManagementRoutes: Routes = [
  {
    path: 'restaurant-campaign',
    component: RestaurantCampaign,
    data: {
      title: 'restaurant_campaign_management'
    }
  },
  {
    path: 'add-restaurant-campaign',
    component: ManageRestaurantCampaign,
    data: {
      title: 'add_restaurant_campaign'
    }
  },
  {
    path: 'manage-restaurant-campaign/:id',
    component: ManageRestaurantCampaign,
    data: {
      title: 'update_restaurant_campaign'
    }
  },
  {
    path: 'dining-campaign',
    component: DiningCampaign,
    data: {
      title: 'dining_campaign_management',
    }
  },
  {
    path: 'add-dining-campaign',
    component: ManageDiningCampaign,
    data: {
      title: 'add_dining_campaign'
    }
  },
  {
    path: 'manage-dining-campaign/:id',
    component: ManageDiningCampaign,
    data: {
      title: 'update_dining_campaign',
    }
  },
  {
    path: 'food-campaign',
    component: FoodCampaign,
    data: {
      title: 'food_campaign_management'
    }
  },
  {
    path: 'add-food-campaign',
    component: ManageFoodCampaign,
    data: {
      title: 'add_food_campaign'
    }
  },
  {
    path: 'manage-food-campaign/:id',
    component: ManageFoodCampaign,
    data: {
      title: 'update_food_campaign'
    }
  },
  {
    path: 'banner-list',
    component: Banners,
    data: {
      title: 'banner_management'
    }
  },
  {
    path: 'coupon-list',
    component: Coupons,
    data: {
      title: 'coupon_management'
    }
  },
  {
    path: 'add-coupon',
    component: DialogManageCoupon,
    data: {
      title: 'add_coupon'
    }
  },
  {
    path: 'edit-coupon/:id',
    component: DialogManageCoupon,
    data: {
      title: 'update_coupon'
    }
  },
  {
    path: 'add-dining-coupon',
    component: DialogManageDiningCoupon,
    data: {
      title: 'add_dining_coupon'
    }
  },
  {
    path: 'edit-dining-coupon/:id',
    component: DialogManageDiningCoupon,
    data: {
      title: 'update_dining_coupon'
    }
  },
  {
    path: 'notifications',
    component: Notifications,
    data: {
      title: 'notifications'
    }
  },
  {
    path: 'restaurant-campaign-detail/:id',
    component: RestaurantCampaignDetail,
    data: {
      title: 'restaurant_campaign_detail'
    }
  },
  {
    path: 'food-campaign-detail/:id',
    component: FoodCampaignDetail,
    data: {
      title: 'food_campaign_detail'
    }
  },
  {
    path: 'dining-campaign-detail/:id',
    component: DiningCampaignDetail,
    data: {
      title: 'dining_campaign_detail'
    }
  },
  {
    path: 'coupon-redeem-orders/:id',
    component: CouponRedeemedOrders,
    data: {
      title: 'coupon_redeem_orders'
    }
  },
  {
    path: 'dining-coupon-redeem-booking/:id',
    component: DiningCouponRedeemedBookings,
    data: {
      title: 'dining_coupon_redeem_booking'
    }
  },
  // Header Banner ("Header & Promotional Banner Configuration"). The same
  // component serves the list and the editor; `manage/:id` hydrates the form tabs.
  {
    path: 'header-banner',
    component: HeaderBanner,
    data: {
      title: 'header_banner'
    }
  },
  {
    path: 'header-banner/manage/:id',
    component: HeaderBanner,
    data: {
      title: 'header_banner'
    }
  }
];
