

export interface VendorExpenseReportInterface {
  expenseType: string
  createdAt: string
  id: string
  amount: number
  userInfo: UserInfo
  orderInfo: OrderInfo
  posOrderInfo: PosOrderInfo
  tableOrderInfo: TableOrderInfo
  bookingInfo: BookingInfo
  couponInfo: CouponInfo
  diningCouponInfo: DiningCouponInfo
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

export interface PosOrderInfo {
  id: string
  orderNo: number
}

export interface TableOrderInfo {
  id: string
  orderNo: number
}

export interface BookingInfo {
  id: string
}

export interface CouponInfo {
  id: string
  name: string
  code: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface DiningCouponInfo {
  id: string
  name: string
  code: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

