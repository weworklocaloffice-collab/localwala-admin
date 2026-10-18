

export interface CityzenVendorOrderReviewListInterface {
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  hashtags: RestaurantHashtag[]
  id: string
  userInfo: UserInfo
  orderInfo: OrderInfo
}

export interface RestaurantHashtag {
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

