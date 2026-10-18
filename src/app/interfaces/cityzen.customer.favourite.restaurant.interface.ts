

export interface CityzenCustomerFavouriteRestaurantInterface {
  restaurant: Restaurant
  createdAt: string
  id: string
  placeOrder: number
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  cover: string
  address: string
  translations: Translation[]
  displayName: string
  displayAddress: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

