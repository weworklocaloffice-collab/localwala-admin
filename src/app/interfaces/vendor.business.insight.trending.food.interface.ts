

export interface VendorBusinessInsightTrendingFoodInterface {
  count: number
  foodDetails: FoodDetails
  offerPrice: number
}

export interface FoodDetails {
  name: string
  image: string
  discountType: string
  translations: Translation[]
  taxationEnable: boolean
  foodTax: string[]
  id: string
  price: number
  discount: number
  foodtaxations: Foodtaxation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface Foodtaxation {
  taxName: string
  translations: Translation2[]
  id: string
  taxAmount: number
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
}

