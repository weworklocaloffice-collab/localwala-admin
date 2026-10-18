

export interface AdminDeliverymanDeletedAccountListInterface {
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobile: string
  gender: string
  city: City
  locality: Locality
  restaurant: Restaurant
  cancelledOrder: number
  delayedOrder: number
  deliveredOrders: number
  rating: number
  type: string
  rejectedOrder: number
  role: string
  totalRating: number
  medias: number
  directChat: number
  supportChat: number
  id: string
  extraEarningOnShiftAmount: number
  incentiveAmount: number
  tipAmount: number
  totalEarning: number
  walletBalance: number
  reasons: Reasons
  createdAt: string
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

export interface Locality {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface Reasons {
  id: string
  name: string
  translations: Translation4[]
  displayName: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  value: string
}

