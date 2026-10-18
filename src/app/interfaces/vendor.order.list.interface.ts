

export interface VendorOrderListInterface {
  paymentMode: string
  orderTo: string
  cookingInstruction: string
  receiverName: string
  countryCode: number
  receiverContact: string
  instantOrder: boolean
  scheduleOrder: boolean
  scheduleDate: string
  orderAt: string
  scheduleTime: string
  userOrderCount: number
  driverOrderPin: string
  customerOrderPin: string
  driverAssign: string
  status: string
  createdAt: string
  id: string
  cartItem: CartItem[]
  grandTotal: number
  itemTotal: number
  couponDiscountCharge: number
  deliveryCharge: number
  foodServiceCharge: number
  serviceCharge: number
  packageCharge: number
  packageChargeTax: number
  walletAmount: number
  deliveryTip: number
  extraCharge: number
  preparationTime: number
  userInfo: UserInfo
  driverInfo: DriverInfo
  paymentInfo: PaymentInfo
}

export interface CartItem {
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
  quantity: number
  optionName: string
  totalPrice: number
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
  enable: boolean
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
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
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  title: string
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  image: string
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
}

export interface PaymentInfo {
  id: string
  slug: string
  name: string
  paymentWay: string
  translations: Translation5[]
  displayName: string
}

export interface Translation5 {
  name: string
  code: string
  nativeName: string
  value: string
}

