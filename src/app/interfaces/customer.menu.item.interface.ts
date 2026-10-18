

import { CustomerMenuFoodInterface } from "./customer.menu.food.interface"

export interface CustomerMenuItemInterface {
  category_id: string
  category_name: string
  category_translations: CategoryTranslation[]
  foods: CustomerMenuFoodInterface[]
}

export interface CategoryTranslation {
  name: string
  code: string
  nativeName: string
  value: string
}
