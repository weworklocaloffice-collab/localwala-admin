

export interface CityzenCustomerDeliverymanReviewInterface {
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  hashtags: DeliverymanHashtag[]
  id: string
  driverInfo: DriverInfo
  orderInfo: OrderInfo
}

export interface DeliverymanHashtag {
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

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

