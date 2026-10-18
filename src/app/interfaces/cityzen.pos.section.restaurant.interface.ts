

export interface CityzenPOSSectionRestaurantInterface {
  name: string
  translations: Translation[]
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

