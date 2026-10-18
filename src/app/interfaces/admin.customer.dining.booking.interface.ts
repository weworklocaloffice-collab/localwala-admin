

export interface AdminCustomerDiningBookingInterface {
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

