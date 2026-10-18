

export interface CityzenUserPurchasedTiffinSubscriptionListInterface {
  restaurant: Restaurant
  orderAt: string
  orderTo: string
  totalOrder: number
  startDate: string
  ordersDates: string[]
  status: string
  id: string
  grandTotal: number
  userInfo: UserInfo
  package: Package
  paymentInfo: PaymentInfo
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
  image: string
  countryCode: number
  contactNumber: string
  role: string
}

export interface Package {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

export interface PaymentInfo {
  id: string
  slug: string
  name: string
  paymentWay: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  value: string
}

// "FB|RJ|2026|ENVATO|FOODBITE|ECITAW15071997"
