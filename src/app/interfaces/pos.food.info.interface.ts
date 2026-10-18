

export interface PosFoodInfoInterface {
  name: string
  shortDescription: string
  image: string
  foodType: string
  addons: Addon[]
  startTime: string
  endTime: string
  discountType: string
  purchaseLimit: number
  variations: Variation[]
  translations: Translation2[]
  inStock: boolean
  status: string
  taxationEnable: boolean
  stockNumber: number
  stockType: string
  foodtaxations: Foodtaxation[]
  id: string
  price: number
  discount: number
  offerPrice: number
  quantity: number
  cartEntity: string
  displayName: string
  displayShortDescription: string
}

export interface Addon {
  name: string
  translations: Translation[]
  inStock: boolean
  stockNumber: number
  stockType: string
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
  stock: number
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface Foodtaxation {
  taxName: string
  translations: Translation3[]
  id: string
  taxAmount: number
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
}

