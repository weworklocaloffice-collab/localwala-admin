

export interface CityzenRestaurantListInterface {
  name: string
  cuisine: Cuisine[]
  moreCuisines: number
  logo: string
  cover: string
  locality: Locality
  translations: Translation4[]
  rating: number
  status: boolean
  slug: string
  id: string
  totalRating: number
  owerInfo: OwerInfo
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

export interface Locality {
  id: string
  name: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

export interface OwerInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

