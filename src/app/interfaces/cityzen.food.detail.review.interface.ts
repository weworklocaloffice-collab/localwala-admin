

export interface CityzenFoodDetailReviewInterface {
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  hashtags: FoodHashtag[]
  id: string
  orderInfo: OrderInfo
  userInfo: UserInfo
}

export interface FoodHashtag {
  name: string
  translations: Translation[]
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  role: string
}

