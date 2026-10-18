import { Routes } from '@angular/router';
import { Categories } from './categories/categories';
import { SubCategories } from './sub-categories/sub-categories';
import { Addons } from './addons/addons';
import { Foods } from './foods/foods';
import { FoodTaxationList } from './food-taxation-list/food-taxation-list';
import { ManageFoods } from './foods/manage-foods/manage-foods';
import { AdminFoodDetails } from './foods/admin-food-details/admin-food-details';

export const FoodManagementRoutes: Routes = [
  {
    path: 'categories',
    component: Categories,
    data: {
      title: 'categories_management'
    }
  },
  {
    path: 'sub-categories',
    component: SubCategories,
    data: {
      title: 'sub_categories_management'
    }
  },
  {
    path: 'addons',
    component: Addons,
    data: {
      title: 'addons_management'
    }
  },
  {
    path: 'list',
    component: Foods,
    data: {
      title: 'food_management'
    }
  },
  {
    path: 'food-taxation-list',
    component: FoodTaxationList,
    data: {
      title: 'food_taxation'
    }
  },
  {
    path: 'add-food',
    component: ManageFoods,
    data: {
      title: 'add_food'
    }
  },
  {
    path: 'edit-food/:id',
    component: ManageFoods,
    data: {
      title: 'update_food'
    }
  },
  {
    path: 'food-detail/:id',
    component: AdminFoodDetails,
    data: {
      title: 'food_detail'
    }
  }
];
