

export interface CityzenTiffinSubscriptionOrderListInterface {
  paymentMode: string
  restaurant: Restaurant
  orderTo: string
  receiverName: string
  countryCode: number
  receiverContact: string
  instantOrder: boolean
  scheduleOrder: boolean
  scheduleDate: string
  orderAt: string
  scheduleTime: string
  status: string
  createdAt: string
  id: string
  grandTotal: number
  userInfo: UserInfo
  paymentInfo: PaymentInfo
  subscriptionTiffinPackage: SubscriptionTiffinPackage
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

export interface SubscriptionTiffinPackage {
  id: string
  name: string
  available: string
  orderTo: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

