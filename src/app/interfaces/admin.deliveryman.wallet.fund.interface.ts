

export interface AdminDeliverymanWalletFundInterface {
  firstName: string
  lastName: string
  role: string
  image: string
  status: boolean
  createdAt: string
  wallets: Wallets
  id: string
  contactEmail: string
  orderCount: number
  orderEarning: number
}

export interface Wallets {
  uuid: string
  id: string
  balance: number
}
