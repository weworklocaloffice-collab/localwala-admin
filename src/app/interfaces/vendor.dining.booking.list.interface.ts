

export interface VendorDiningBookingListInterface {
  bookingDate: string
  bookingSlot: string
  guest: number
  userName: string
  userCountryCode: number
  specialRequest: string
  status: string
  createdAt: string
  id: string
  userContact: string
  userEmail: string
  couponCoverCharge: number
  preBookingCharge: number
  grandTotal: number
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

