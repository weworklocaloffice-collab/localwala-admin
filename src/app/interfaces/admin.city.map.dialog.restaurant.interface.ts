

export interface AdminCityMapDialogRestaurantInterface {
  name: string
  logo: string
  cover: string
  locality: Locality
  location: Location
  translations: Translation2[]
  rating: number
  id: string
  totalRating: number
  owerInfo: OwerInfo
  displayName: string
}

export interface Locality {
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
  title: string
  address: string
  shortDescription: string
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

