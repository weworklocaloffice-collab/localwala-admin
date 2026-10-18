

export interface CityzenDriverListInterface {
  locality: Locality
  type: string
  activeStatus: boolean
  orderHandling: number
  status: boolean
  isBlocked: boolean
  rating: number
  id: string
  totalRating: number
  driverInfo: DriverInfo
  offline: Offline
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

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

export interface Offline {
  id: string
  name: string
  translations: TranslationOffline[]
  displayName: string
}

export interface TranslationOffline {
  name: string
  code: string
  nativeName: string
  value: string
}

