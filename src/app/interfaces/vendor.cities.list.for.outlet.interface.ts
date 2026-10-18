

export interface VendorCitiesListForOutletInterface {
  location: Location
  name: string
  translations: Translation[]
  id: string
  displayName: string
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

