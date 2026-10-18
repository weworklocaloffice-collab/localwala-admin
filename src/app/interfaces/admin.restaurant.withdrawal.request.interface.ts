

export interface AdminRestaurantWithdrawalRequestInterface {
  restaurant: Restaurant
  status: string
  createdAt: string
  id: string
  amount: number
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  cover: string
  slug: string
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

