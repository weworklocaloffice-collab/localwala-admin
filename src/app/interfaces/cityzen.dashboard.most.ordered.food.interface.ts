

export interface CityzenDashboardMostOrderedFoodInterface {
  name: string
  image: string
  translations: Translation[]
  orderCount: number
  restaurants: Restaurants
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
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
  shortDescription: string
}

