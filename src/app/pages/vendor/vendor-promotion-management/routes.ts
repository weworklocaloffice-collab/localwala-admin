import { Routes } from '@angular/router';
import { FoodCampaign } from './promotion-management/campaign/food-campaign/food-campaign';
import { RestaurantCampaign } from './promotion-management/campaign/restaurant-campaign/restaurant-campaign';
import { DiningCampaign } from './promotion-management/campaign/dining-campaign/dining-campaign';
import { Coupons } from './promotion-management/coupons/coupons';
import { ManageOrderCoupon } from './promotion-management/coupons/orders-coupon-list/manage-order-coupon/manage-order-coupon';
import { ManageVendorDiningCoupon } from './promotion-management/coupons/dining-coupon-list/manage-vendor-dining-coupon/manage-vendor-dining-coupon';

export const VendorPromotionManagementRoutes: Routes = [
  {
    path: 'food-campaign',
    component: FoodCampaign,
    data: {
      title: 'food_campaign_management'
    }
  },
  {
    path: 'restaurant-campaign',
    component: RestaurantCampaign,
    data: {
      title: 'restaurant_campaign_management'
    }
  },
  {
    path: 'dining-campaign',
    component: DiningCampaign,
    data: {
      title: 'dining_campaign_management'
    }
  },
  {
    path: 'coupons',
    component: Coupons,
    data: {
      title: 'coupon_management'
    }
  },
  {
    path: 'add-coupon',
    component: ManageOrderCoupon,
    data: {
      title: 'add_coupon'
    }
  },
  {
    path: 'edit-coupon/:id',
    component: ManageOrderCoupon,
    data: {
      title: 'update_coupon'
    }
  },
  {
    path: 'add-dining-coupon',
    component: ManageVendorDiningCoupon,
    data: {
      title: 'add_dining_coupon'
    }
  },
  {
    path: 'edit-dining-coupon/:id',
    component: ManageVendorDiningCoupon,
    data: {
      title: 'update_dining_coupon'
    }
  }
];
