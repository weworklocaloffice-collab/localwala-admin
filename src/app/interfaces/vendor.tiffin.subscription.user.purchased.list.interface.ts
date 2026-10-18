

export interface VendorTiffinSubscriptionUserPurchasedListInterface {
  orderAt: string
  orderTo: string
  totalOrder: number
  ordersDates: string[]
  status: string
  id: string
  grandTotal: number
  startDate: string
  userInfo: UserInfo
  paymentInfo: PaymentInfo
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

export interface PaymentInfo {
  id: string
  slug: string
  name: string
  paymentWay: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

