

export interface CityzenRestaurantRegisterRequestListInterface {
  name: string
  address: string
  cuisine: Cuisine[]
  moreCuisines: number
  logo: string
  cover: string
  locality: Locality
  firstName: string
  lastName: string
  businessType: string
  status: string
  createdAt: string
  countryCode: number
  contactNumber: string
  contactEmail: string
  id: string
  subscriptionInfo: SubscriptionInfo
  translations: Translation4[]
  displayName: string
  displayAddress: string
}

export interface Locality {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Cuisine {
  name: string
  translations: Translation[]
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface SubscriptionInfo {
  id: string
  name: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescriptions: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

