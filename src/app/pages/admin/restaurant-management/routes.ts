import { Routes } from '@angular/router';
import { Cities } from './cities/cities';
import { Localities } from './localities/localities';
import { Cuisine } from './cuisine/cuisine';
import { RestaurantTypes } from './restaurant-types/restaurant-types';
import { RestaurantFacilities } from './restaurant-facilities/restaurant-facilities';
import { Restaurants } from './restaurants/restaurants';
import { Outlets } from './outlets/outlets';
import { ReportIssueRestaurant } from './report-issue-restaurant/report-issue-restaurant';
import { HiddenRestaurants } from './hidden-restaurants/hidden-restaurants';
import { RestaurantWaiterList } from './restaurant-waiter-list/restaurant-waiter-list';
import { RestaurantKitchenOwnerList } from './restaurant-kitchen-owner-list/restaurant-kitchen-owner-list';
import { RestaurantJoiningRequest } from './restaurant-joining-request/restaurant-joining-request';
import { DialogCityMaps } from './cities/dialog-city-maps/dialog-city-maps';
import { ManageRestaurant } from './restaurants/manage-restaurant/manage-restaurant';
import { RestaurantDetail } from './restaurants/restaurant-detail/restaurant-detail';
import { FilterRestaurantsList } from './restaurants/filter-restaurants-list/filter-restaurants-list';
import { FilterRestaurantsQuery } from './restaurants/filter-restaurants-query/filter-restaurants-query';
import { DialogRestaurantWaiter } from './restaurant-waiter-list/dialog-restaurant-waiter/dialog-restaurant-waiter';
import { DialogRestaurantKitchenOwner } from './restaurant-kitchen-owner-list/dialog-restaurant-kitchen-owner/dialog-restaurant-kitchen-owner';
import { RestaurantJoiningRequestDetail } from './restaurant-joining-request/restaurant-joining-request-detail/restaurant-joining-request-detail';

export const RestaurantManagementRoutes: Routes = [
  {
    path: 'cities',
    component: Cities,
    data: {
      title: 'city_management'
    }
  },
  {
    path: 'localities',
    component: Localities,
    data: {
      title: 'localities_management'
    }
  },
  {
    path: 'cuisine',
    component: Cuisine,
    data: {
      title: 'cuisine_management'
    }
  },
  {
    path: 'restaurant-type',
    component: RestaurantTypes,
    data: {
      title: 'restaurant_type_management'
    }
  },
  {
    path: 'restaurant-facilities',
    component: RestaurantFacilities,
    data: {
      title: 'restaurant_facilities_management'
    }
  },
  {
    path: 'restaurants',
    component: Restaurants,
    data: {
      title: 'restaurant_management'
    }
  },
  {
    path: 'add-restaurant',
    component: ManageRestaurant,
    data: {
      title: 'add_restaurant'
    }
  },
  {
    path: 'edit-restaurant/:id',
    component: ManageRestaurant,
    data: {
      title: 'update_restaurant'
    }
  },
  {
    path: 'outlets',
    component: Outlets,
    data: {
      title: 'outlet_management'
    }
  },
  {
    path: 'report-issue-restaurants',
    component: ReportIssueRestaurant,
    data: {
      title: 'report_issue_restaurants'
    }
  },
  {
    path: 'hidden-restaurants',
    component: HiddenRestaurants,
    data: {
      title: 'hidden_restaurants'
    }
  },
  {
    path: 'restaurant-waiter-list',
    component: RestaurantWaiterList,
    data: {
      title: 'waiter_list'
    }
  },
  {
    path: 'restaurant-kitchen-owner-list',
    component: RestaurantKitchenOwnerList,
    data: {
      title: 'kitchen_owner'
    }
  },
  {
    path: 'edit-restaurant-kitchen-owner/:id',
    component: DialogRestaurantKitchenOwner,
    data: {
      title: 'update_kitchen_owner'
    }
  },
  {
    path: 'edit-restaurant-waiter/:id',
    component: DialogRestaurantWaiter,
    data: {
      title: 'update_waiter'
    }
  },
  {
    path: 'restaurant-joining-request',
    component: RestaurantJoiningRequest,
    data: {
      title: 'restaurant_joining_request'
    }
  },
  {
    path: 'restaurant-joining-request-detail/:id',
    component: RestaurantJoiningRequestDetail,
    data: {
      title: 'restaurant_joining_request_detail'
    }
  },
  {
    path: 'restaurant-detail/:id',
    component: RestaurantDetail,
    data: {
      title: 'restaurant_detail'
    }
  },
  {
    path: 'city-detail/:id',
    component: DialogCityMaps,
    data: {
      title: 'city_detail'
    }
  },
  {
    path: 'filter-restaurant-list/:type/:name/:id',
    component: FilterRestaurantsList,
    data: {
      title: 'filter_restaurants'
    }
  },
  {
    path: 'filter-restaurant-query',
    component: FilterRestaurantsQuery,
    data: {
      title: 'filter_restaurants'
    }
  }
];
