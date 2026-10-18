

export interface CustomerTableOngoingOrderCartItemInterface {
  uuid: string
  addons: CustomerTableOngoingOrderCartAddon[]
  food: string
  quantity: number
  variations: CustomerTableOngoingOrderCartVariation[]
  instruction: string
  foodtaxations: CustomerTableOngoingOrderCartFoodtaxation[]
  id: string
  foodInfo: CustomerTableOngoingOrderCartFoodInfo
  itemPrice: number
  realPrice: number
  itemDiscount: number
  optionName: string
}

export interface CustomerTableOngoingOrderCartAddon {
  name: string
  translations: Translation[]
  id: string
  price: number
  displayName: string;
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface CustomerTableOngoingOrderCartVariation {
  variation: string
  selected: string[]
}

export interface CustomerTableOngoingOrderCartFoodtaxation {
  id: string
  taxAmount: number
}

export interface CustomerTableOngoingOrderCartFoodInfo {
  id: string
  name: string
  discountType: string
  foodVariations: CustomerTableOngoingOrderCartFoodVariation[]
  taxationEnable: boolean
  foodType: string
  price: number
  discount: number
  translations: Translation2[]
  displayName: string;
}

export interface CustomerTableOngoingOrderCartFoodVariation {
  isRequired: string
  title: string
  type: string
  min: string
  max: string
  options: CustomerTableOngoingOrderCartOption[]
}

export interface CustomerTableOngoingOrderCartOption {
  name: string
  price: string
  stock: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}
