

export interface AdminCustomerHiddenRestaurantInterface {
  restaurant: Restaurant
  createdAt: string
  reasons: Reasons
  id: string
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

export interface Reasons {
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

