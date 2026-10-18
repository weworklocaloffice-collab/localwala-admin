

export interface VendorPosOrderListInterface {
  orderNo: number
  paymentMode: string
  customerType: string
  customerName: string
  orderFrom: string
  tableOrder: boolean
  status: string
  createdAt: string
  id: string
  itemTotal: number
  discountCharge: number
  foodServiceCharge: number
  serviceCharge: number
  packageCharge: number
  packageChargeTax: number
  waiterTip: number
  extraCharge: number
  grandTotal: number
  cartItem: CartItem[]
}

export interface CartItem {
  name: string
  uuid: string
  addons: Addon[]
  variations: Variation[]
  discount: number
  discountType: string
  endTime: string
  foodType: string
  foodtaxations: Foodtaxation[]
  id: string
  image: string
  inStock: boolean
  price: number
  purchaseLimit: number
  quantity: number
  restaurant: string
  shortDescription: string
  startTime: string
  status: string
  taxationEnable: boolean
  totalPrice: number
  translations: Translation3[]
  optionName: string
  displayName: string
  displayShortDescription: string
}

export interface Addon {
  name: string
  translations: Translation[]
  status: boolean
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
  isRequired: string
  max: string
  min: string
  title: string
  type: string
  options: Option[]
}

export interface Option {
  name: string
  price: string
  stock: string
}

export interface Foodtaxation {
  taxName: string
  translations: Translation2[]
  id: string
  taxAmount: number
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}


