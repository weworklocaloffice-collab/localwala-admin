

export interface CityzenCustomerFavouriteFoodInterface {
  food: Food
  createdAt: string
  id: string
  purchased: number
}

export interface Food {
  id: string
  name: string
  image: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

