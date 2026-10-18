

export interface CityzenDeliverymanRestaurantComplaintInterface {
  title: string
  brief: string
  issueWith: string
  status: boolean
  createdAt: string
  reasons: Reasons
  id: string
  userInfo: UserInfo
  orderInfo: OrderInfo
}

export interface Reasons {
  id: string
  name: string
  translations: Translation[]
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
  countryCode: string
  contactNumber: string
  role: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

