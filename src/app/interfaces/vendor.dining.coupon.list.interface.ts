

export interface VendorDiningCouponListInterface {
  name: string
  city: City
  code: string
  limitSameUser: number
  start: string
  expires: string
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
  image: string
  translations: Translation[]
  slug: string
  status: boolean
  location: Location
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

