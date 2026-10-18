

export interface AdminCitiesListInterface {
  name: string
  image: string
  location: Location
  translations: Translation[]
  status: boolean
  slug: string
  id: string
  localities: number
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

