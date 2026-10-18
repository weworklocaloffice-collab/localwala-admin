

export interface VendorReviewListInterface {
  orders: string
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  hashtags: Hashtag[]
  id: string
  userInfo: UserInfo
}

export interface Hashtag {
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
  image: string
}

