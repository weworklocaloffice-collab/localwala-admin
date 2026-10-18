

export interface AccountantDiningBookingReportInterface {
  paymentMode: string
  restaurant: Restaurant
  userName: string
  status: string
  createdAt: string
  id: string
  preBookingCharge: number
  couponCoverCharge: number
  grandTotal: number
  bookingCommission: number
  paymentInfo: PaymentInfo
  bookingDate: string
  bookingSlot: string
  userInfo: UserInfo
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

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  role: string
}

