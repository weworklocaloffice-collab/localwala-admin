

export interface AdminRestaurantDeletedAccountListInterface {
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobile: string
  gender: string
  city: City
  locality: Locality
  name: string
  address: string
  slug: string
  rating: number
  type: string
  commission: number
  posOrderCommission: number
  tableOrderCommission: number
  totalRating: number
  deliverymans: number
  tiffinPackages: number
  soldTiffinPackages: number
  orderRefund: number
  diningRefund: number
  tiffinRefund: number
  userComplaints: number
  restaurantComplaints: number
  orders: number
  foods: number
  diningBookings: number
  posOrders: number
  tableOrders: number
  medias: number
  directChat: number
  supportChat: number
  pos: boolean
  ownDriver: boolean
  promote: boolean
  customCategory: boolean
  multiOutlet: boolean
  preBooking: boolean
  tableOrder: boolean
  tiffinSubscription: boolean
  ownWaiter: boolean
  ownKitchen: boolean
  takeAway: boolean
  acceptScheduleDelivery: boolean
  acceptHomeDelivery: boolean
  translations: Translation3[]
  createdAt: string
  id: string
  walletBalance: number
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
  reasons: Reasons
  subscriptionInfo: SubscriptionInfo
  displayName: string
  displayAddress: string
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

export interface Reasons {
  id: string
  name: string
  translations: Translation4[]
  displayName: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface SubscriptionInfo {
  name: string
  translations: Translation5[]
  displayName: string
}

export interface Translation5 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescriptions: string
}

