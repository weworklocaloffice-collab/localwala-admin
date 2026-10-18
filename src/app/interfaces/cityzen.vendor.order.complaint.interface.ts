

export interface CityzenVendorOrderComplaintInterface {
  title: string
  brief: string
  issueWith: string
  status: boolean
  createdAt: string
  reasons: Reasons
  id: string
  userInfo: UserInfo
  driverInfo: DriverInfo
  orderInfo: OrderInfo
  foodInfo: FoodInfo
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
  countryCode: number
  contactNumber: string
  role: string
}

export interface DriverInfo {
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

export interface FoodInfo {
  id: string
  name: string
  image: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

