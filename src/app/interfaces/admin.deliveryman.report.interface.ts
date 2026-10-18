

export interface AdminDeliverymanReportInterface {
  firstName: string
  lastName: string
  role: string
  image: string
  countryCode: number
  createdAt: string
  wallets: Wallet
  id: string
  contactNumber: string
  contactEmail: string
  driverInfo: DriverInfo
  totalEarning: number
  tipAmount: number
  incentiveAmount: number
  extraEarningOnShiftAmount: number
  deliveredOrders: number
  rejectedOrder: number
  cancelledOrder: number
  delayedOrder: number
  totalRating: number,
  city: City
  locality: Locality
}

export interface Wallet {
  uuid: string
  id: string
  balance: number
}

export interface DriverInfo {
  id: string
  type: string
  rating: number
}

export interface City {
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

export interface Locality {
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

