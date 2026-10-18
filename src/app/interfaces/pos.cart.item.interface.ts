

export interface PosCartItemInterface {
  uuid: string
  name: string
  image: string
  price: number
  discountType: string
  discount: number
  offerPrice: number
  purchaseLimit: number
  stockNumber: number
  stockType: string
  quantity: number
  id: string
  addons: Addon[]
  variations: Variation[]
  translations: Translation2[]
  inStock: boolean
  taxationEnable: boolean
  foodtaxations: Foodtaxation[]
  optionName: string
  totalPrice: number
  realPrice: number
  itemDiscount: number
  instruction: string
  displayName: string
}

export interface Addon {
  name: string
  translations: Translation[]
  id: string
  price: number
  inStock: boolean
  stockNumber: number
  stockType: string
  haveDiscount: boolean
  discountPrice: number
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
  haveDiscount: boolean
  discountPrice: number
  enable: boolean
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

