

export interface CityzenLocalitiesListInterface {
  name: string
  location: Location
  translations: Translation[]
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

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

