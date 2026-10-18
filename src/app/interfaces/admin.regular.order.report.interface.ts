

export interface AdminRegularOrderReportInterface {
  orderNo: number
  paymentMode: string
  restaurant: Restaurant
  orderTo: string
  status: string
  id: string
  realTotal: number
  itemTotal: number
  itemDiscount: number
  couponDiscountCharge: number
  deliveryCharge: number
  foodServiceCharge: number
  serviceCharge: number
  packageCharge: number
  packageChargeTax: number
  deliveryTip: number
  extraCharge: number
  walletAmount: number
  grandTotal: number
  refundedAmount: number
  driverEarining: number
  deliveryCommission: number
  restaurantCommission: number
  userInfo: UserInfo
  paymentInfo: PaymentInfo
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  role: string
}

export interface PaymentInfo {
  id: string
  name: string
  paymentWay: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

