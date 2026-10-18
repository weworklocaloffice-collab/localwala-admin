

export interface AdminKitchenDeletedAccountListInterface {
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobile: string
  gender: string
  restaurant: Restaurant
  createdAt: string
  id: string
  reasons: Reasons
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

