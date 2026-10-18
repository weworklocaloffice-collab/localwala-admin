

export interface AdminPOSSectionCitiesInterface {
  name: string
  location: Location
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

