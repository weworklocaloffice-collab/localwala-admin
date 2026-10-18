

export interface AdminCustomerOrderListInterface {
  orderNo: number
  paymentMode: string
  restaurant: Restaurant
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
  paymentInfo: PaymentInfo
}

export interface Restaurant {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface PaymentInfo {
  id: string
  name: string
  paymentWay: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

