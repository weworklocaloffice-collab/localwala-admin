

export interface AdminVendorOrderRefundRequestListInterface {
  orders: string
  refundTo: string
  status: string
  createdAt: string
  id: string
  amount: number
  paymentInfo: PaymentInfo
  reason: Reason
  userInfo: UserInfo
}

export interface PaymentInfo {
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

export interface Reason {
  id: string
  name: string
  translations: Translation2[]
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
}

