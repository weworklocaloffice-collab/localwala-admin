

import { CustomerMenuFoodInterface } from "./customer.menu.food.interface"

export interface CustomerMenuCategoriesInterface {
  id: string
  displayName: string
  items: CustomerMenuFoodInterface[]
  inView: boolean
}
