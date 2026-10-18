

export interface CityzenVendorFoodReviewListInterface {
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  foods: Foods
  hashtags: FoodHashtag[]
  id: string
  userInfo: UserInfo
  orderInfo: OrderInfo
}

export interface Foods {
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

export interface FoodHashtag {
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

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  countryCode: number
  contactNumber: string
  role: string
  image: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

