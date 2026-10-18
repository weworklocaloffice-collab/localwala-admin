

export interface AdminCustomerDeliverymanReviewInterface {
  ratingCount: number
  images: string[]
  shortReview: string
  createdAt: string
  hashtags: HashtagDeliveryman[]
  id: string
  driverInfo: DriverInfo
  orderInfo: OrderInfo
}

export interface HashtagDeliveryman {
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

