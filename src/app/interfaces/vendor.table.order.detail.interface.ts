

export interface VendorTableOrderDetailInterface {
  uuid: string
  addons: Addon[]
  food: string
  quantity: number
  variations: Variation[]
  instruction: string
  foodtaxations: Foodtaxation[]
  id: string
  foodInfo: FoodInfo
  itemPrice: number
  realPrice: number
  itemDiscount: number
  optionName: string
}

export interface Addon {
  name: string
  translations: Translation[]
  id: string
  price: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Variation {
  variation: string
  selected: string[]
}

export interface Foodtaxation {
  id: string
  taxAmount: number
}

export interface FoodInfo {
  id: string
  name: string
  discountType: string
  foodVariations: FoodVariation[]
  taxationEnable: boolean
  foodType: string
  price: number
  discount: number
  translations: Translation2[]
  displayName: string
}

export interface FoodVariation {
  isRequired: string
  title: string
  type: string
  min: string
  max: string
  options: Option[]
}

export interface Option {
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

