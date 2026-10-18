

export interface VendorCashInHandHistoryInterface {
  status: boolean
  createdAt: string
  id: string
  orderInfo: OrderInfo
}

export interface OrderInfo {
  id: string
  orderNo: number
  grandTotal: number
}
