

export interface CityzenAddonsListInterface {
  name: string
  translations: Translation[]
  status: boolean
  restaurant: string
  inStock: boolean
  stockType: string
  stockNumber: number
  restaurants: Restaurants
  id: string
  price: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Restaurants {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

