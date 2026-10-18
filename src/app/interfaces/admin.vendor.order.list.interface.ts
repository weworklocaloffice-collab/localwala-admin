

export interface AdminVendorOrderListInterface {
  orderNo: number
  paymentMode: string
  orderTo: string
  receiverName: string
  countryCode: number
  receiverContact: string
  instantOrder: boolean
  scheduleOrder: boolean
  scheduleDate: string
  orderAt: string
  scheduleTime: string
  status: string
  createdAt: string
  id: string
  grandTotal: number
  userInfo: UserInfo
  paymentInfo: PaymentInfo
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  countryCode: number
  contactNumber: string
  role: string
}

export interface PaymentInfo {
  id: string
  name: string
  paymentWay: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

