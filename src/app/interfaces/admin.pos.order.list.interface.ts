

export interface AdminPosOrderInterface {
  orderNo: number
  restaurant: Restaurant
  paymentMode: string
  customerType: string
  customerName: string
  orderFrom: string
  tableOrder: boolean
  status: string
  createdAt: string
  totalEarning: number
  id: string
  grandTotal: number
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

