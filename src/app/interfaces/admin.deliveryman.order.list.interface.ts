

export interface AdminDeliverymanOrderListInterface {
  orderId: string
  restaurant: Restaurant
  driverOrderStatus: string
  orderFrom: string
  createdAt: string
  id: string
  orderInfo: OrderInfo
  earning: number
  tipAmount: number
  incentiveAmount: number
  extraEarningOnShiftAmount: number
  deliveryAddressRaw: DeliveryAddressRaw
}

export interface Restaurant {
  id: string
  name: string
  address: string
  translations: Translation[]
  displayName: string
  displayAddress: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface OrderInfo {
  id: string
  orderNo: number
}

export interface DeliveryAddressRaw {
  location: Location
  user: string
  title: number
  receiverName: string
  countryCode: number
  receiverContact: string
  flatHouse: string
  locality: string
  landmark: string
  status: boolean
  id: string
}

export interface Location {
  type: string
  coordinates: number[]
}

