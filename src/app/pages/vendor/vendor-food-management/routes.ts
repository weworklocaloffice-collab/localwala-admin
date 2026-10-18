import { Routes } from '@angular/router';
import { Addons } from './food-management/addons/addons';
import { Categories } from './food-management/categories/categories';
import { SubCategories } from './food-management/sub-categories/sub-categories';
import { Foods } from './food-management/foods/foods';
import { ManageFood } from './food-management/foods/manage-food/manage-food';

export const VendorFoodManagementRoutes: Routes = [
  {
    path: 'addons',
    component: Addons,
    data: {
      title: 'addons_management'
    }
  },
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
    path: 'food-list',
    component: Foods,
    data: {
      title: 'food_management'
    }
  },
  {
    path: 'food-add',
    component: ManageFood,
    data: {
      title: 'add_food'
    }
  },
  {
    path: 'edit-food/:id',
    component: ManageFood,
    data: {
      title: 'update_food'
    }
  },
];
