

export interface AccountantPaymentTransactionReportInterface {
  paymentFrom: string
  status: string
  createdAt: string
  id: string
  amount: number
  userInfo: UserInfo
  orderInfo: OrderInfo
  tiffinSubscriptionPackageInfo: TiffinSubscriptionPackageInfo
  diningBookingInfo: DiningBookingInfo
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  role: string
  image: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

export interface TiffinSubscriptionPackageInfo {
  id: string
  package: string
}

export interface DiningBookingInfo {
  id: string
}
