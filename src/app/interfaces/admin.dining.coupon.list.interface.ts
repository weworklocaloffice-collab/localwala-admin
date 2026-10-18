

export interface AdminDiningCouponListInterface {
  name: string
  city: City
  code: string
  limitSameUser: number
  start: string
  expires: string
  redeem: number
  availability: string
  preBookingChargeRequired: boolean
  preBookingChargeAmount: number
  translations: Translation2[]
  status: string
  id: string
  displayName: string
}

export interface City {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

