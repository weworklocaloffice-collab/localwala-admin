

export interface AccountantCustomerReportInterface {
  firstName: string
  lastName: string
  role: string
  image: string
  countryCode: number
  createdAt: string
  wallets: Wallets
  id: string
  contactNumber: string
  contactEmail: string
  orderCount: number
  diningBookings: number
  tiffinPackages: number
  favRest: number
  favFood: number
  favOrders: number
  medias: number
  orderRefund: number
  diningRefund: number
  tiffinRefund: number
  hiddenRest: number
  diningGrandTotal: number
  orderGrandTotal: number
  tiffinPackageGrandTotal: number
  loyaltyPoints: number
}

export interface Wallets {
  uuid: string
  id: string
  balance: number
}
