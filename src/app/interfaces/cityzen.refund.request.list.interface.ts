

export interface CityzenRefundRequestListInterface {
  orders: string
  restaurant: Restaurant
  refundTo: string
  status: string
  createdAt: string
  id: string
  amount: number
  userInfo: UserInfo
  paymentInfo: PaymentInfo
  reason: Reason
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
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  countryCode: number
  contactNumber: string
  role: string
}

export interface PaymentInfo {
  id: string
  slug: string
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

export interface Reason {
  id: string
  name: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  value: string
}

