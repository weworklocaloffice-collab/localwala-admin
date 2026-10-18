

export interface AdminCityMapDialogDriverInterface {
  locality: Locality
  location: Location
  rating: number
  id: string
  totalRating: number
  driverInfo: DriverInfo
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

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

