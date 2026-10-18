

export interface AdminWaiterDeletedAccountListInterface {
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobile: string
  gender: string
  restaurant: Restaurant
  orderCount: number
  id: string
  reasons: Reasons
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  cover: string
  slug: string
  address: string
  translations: Translation[]
  displayName: string
  displayAddress: string
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

// "FB|RJ|2026|ENVATO|FOODBITE|ECITAW15071997"
