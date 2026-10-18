

export interface AdminDiningBookingListInterface {
  paymentMode: string
  restaurant: Restaurant
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
  countryCode: number
  contactNumber: string
  role: string
}

export interface PaymentInfo {
  id: string
  slug: string
  name: string
  paymentWay: string
  translations: CommanTranslation[]
  displayName: string
}

export interface CommanTranslation {
  name: string
  code: string
  nativeName: string
  value: string
}

