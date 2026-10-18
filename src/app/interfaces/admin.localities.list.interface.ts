

export interface AdminLocalitiesListInterface {
  name: string
  location: Location
  city: City
  translations: Translation2[]
  status: boolean
  slug: string
  id: string
  restaurants: number
  displayName: string
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface City {
  id: string
  name: string
  slug: string
  translations: Translation[]
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

