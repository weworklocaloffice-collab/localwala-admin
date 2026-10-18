

export interface OrderCartListInterface {
  uuid: string
  name: string
  shortDescription: string
  image: string
  restaurant: string
  foodType: string
  price: number
  discountType: string
  discount: number
  offerPrice: number
  addons: Addon[]
  variations: Variation[]
  translations: Translation2[]
  purchaseLimit: number
  restaurantInfo: RestaurantInfo
  quantity: number
  optionName: string
  realPrice: number
  totalPrice: number
  itemDiscount: number
  status: string
  inStock: boolean
  startTime: string
  endTime: string
  foodtaxations: Foodtaxations
  taxationEnable: boolean
  id: string
  displayName: string
  displayShortDescription: string
}

export interface Addon {
  name: string
  translations: Translation[]
  id: string
  price: number
  discountType: string
  discount: number
  offerPrice: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Variation {
  isRequired: boolean
  title: string
  type: string
  min: number
  max: number
  options: Option[]
}

export interface Option {
  name: string
  price: number
  discountType: string
  discount: number
  offerPrice: number
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface RestaurantInfo {
  id: string
  name: string
  logo: string
  cover: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

export interface Foodtaxations {
  taxation: Taxation[]
  id: string
  overAllTaxation: number
}

export interface Taxation {
  name: string
  taxAmount: number
  uuid: string
  translation: Translation4[]
  displayName: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  title: string
}

