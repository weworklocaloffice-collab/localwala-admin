

export interface CityzenCustomerRestaurantReviewInterface {
  orders: string
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  restaurants: Restaurants
  hashtags: RestaurantHashtag[]
  id: string
  orderInfo: OrderInfo
}

export interface Restaurants {
  id: string
  name: string
  address: string
  cover: string
  logo: string
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

export interface RestaurantHashtag {
  name: string
  translations: Translation2[]
  id: string
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

