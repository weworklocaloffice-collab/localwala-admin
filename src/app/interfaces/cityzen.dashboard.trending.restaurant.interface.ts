

export interface CityzenDashboardTrendingRestaurantInterface {
  name: string
  logo: string
  city: City
  locality: Locality
  translations: Translation3[]
  totalOrders: number
  id: string
  displayName: string
}

export interface City {
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

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

