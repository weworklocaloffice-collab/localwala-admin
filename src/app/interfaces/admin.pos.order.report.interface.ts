

export interface AdminPosOrderReportInterface {
  orderNo: number
  restaurant: Restaurant
  paymentMode: string
  customerType: string
  customerName: string
  customerCountryCode: number
  discountType: string
  status: string
  id: string
  customerMobileNumber: string
  realTotal: number
  itemTotal: number
  itemDiscount: number
  discountAmount: number
  discountCharge: number
  foodServiceCharge: number
  serviceCharge: number
  packageCharge: number
  packageChargeTax: number
  waiterTip: number
  extraCharge: number
  grandTotal: number
  restaurantCommission: number
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

