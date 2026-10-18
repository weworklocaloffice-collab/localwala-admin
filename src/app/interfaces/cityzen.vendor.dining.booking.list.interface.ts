

export interface CityzenVendorDiningBookingListInterface {
  paymentMode: string
  bookingDate: string
  bookingSlot: string
  guest: number
  userName: string
  userCountryCode: number
  status: string
  id: string
  grandTotal: number
  userContact: string
  userEmail: string
  userInfo: UserInfo
  paymentInfo: PaymentInfo
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
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

