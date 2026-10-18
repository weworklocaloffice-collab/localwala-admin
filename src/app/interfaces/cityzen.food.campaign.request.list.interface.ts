

export interface CityzenFoodCampaignRequestListInterface {
  food: string
  restaurant: string
  campaign: string
  restaurants: Restaurants
  foods: Foods
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

export interface Foods {
  id: string
  name: string
  shortDescription: string
  image: string
  price: number
  discount: number
  discountType: string
  translations: Translation2[]
  displayName: string
  displayShortDescription: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

