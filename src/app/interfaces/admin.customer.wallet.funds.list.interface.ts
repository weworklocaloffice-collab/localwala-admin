

export interface AdminCustomerWalletFundInterface {
  firstName: string
  lastName: string
  image: string
  status: boolean
  createdAt: string
  wallets: Wallets
  id: string
  contactEmail: string
  orderCount: number
  totalGrandTotal: number
  loyaltyPoints: number
}

export interface Wallets {
  uuid: string
  id: string
  balance: number
}
