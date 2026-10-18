

export interface AccountantFoodReportInterface {
  name: string
  image: string
  foodType: string
  translations: Translation[]
  rating: number
  restaurants: Restaurants
  id: string
  price: number
  totalSoldAmount: number
  discountAmountGiven: number
  orderSoldCount: number
  averageSell: number
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

