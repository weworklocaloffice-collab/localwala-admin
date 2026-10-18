

export interface AdminDiningCouponRequestListInterface {
  name: string
  city: City
  code: string
  limitSameUser: number
  start: string
  expires: string
  discountType: string
  minDiscount: number
  maxDiscount: number
  translations: Translation2[]
  status: string
  id: string
  restaurantInfo: RestaurantInfo
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

export interface RestaurantInfo {
  id: string
  name: string
  logo: string
  cover: string
  slug: string
  address: string
  translations: Translation3[]
  displayName: string
  displayAddress: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

