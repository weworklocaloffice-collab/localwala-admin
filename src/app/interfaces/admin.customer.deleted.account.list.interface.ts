

export interface AdminCustomerDeletedAccountListInterface {
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobile: string
  gender: string
  diningBookings: number
  diningRefund: number
  favFood: number
  favOrders: number
  favRest: number
  hiddenRest: number
  medias: number
  orderCount: number
  orderRefund: number
  tiffinPackages: number
  tiffinRefund: number
  userComplaints: number
  restaurantComplaints: number
  directChat: number
  supportChat: number
  id: string
  diningGrandTotal: number
  loyaltyPoints: number
  orderGrandTotal: number
  tiffinPackageGrandTotal: number
  walletBalance: number
  reasons: Reasons
  createdAt: string
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

