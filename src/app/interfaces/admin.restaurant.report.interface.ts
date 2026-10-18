

export interface AdminRestaurantReportInterface {
  name: string
  logo: string
  cover: string
  city: City
  locality: Locality
  translations: Translation3[]
  rating: number
  orderEarningAmount: number
  orderDiscountGivenAmount: number
  orderRestaurantCommission: number
  orderFoodTaxAmount: number
  orderServiceChargeAmount: number
  posEarningAmount: number
  posDiscountGivenAmount: number
  posRestaurantCommission: number
  posFoodTaxAmount: number
  posServiceChargeAmount: number
  tableOrderEarningAmount: number
  tableOrderDiscountGivenAmount: number
  tableOrderRestaurantCommission: number
  tableOrderFoodTaxAmount: number
  tableOrderServiceChargeAmount: number
  diningEarningAmount: number
  diningCommissionAmount: number
  id: string
  orders: number
  foods: number
  diningBookings: number
  posOrders: number
  tableOrders: number
  owerInfo: OwerInfo
  displayName: string
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

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface OwerInfo {
  id: string
  firstName: string
  lastName: string
}

