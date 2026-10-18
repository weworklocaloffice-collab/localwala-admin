

export interface AdminDiningCampaignListRequestInterface {
  restaurant: string
  campaign: string
  restaurants: Restaurants
  id: string
}

export interface Restaurants {
  id: string
  name: string
  cover: string
  logo: string
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
}

