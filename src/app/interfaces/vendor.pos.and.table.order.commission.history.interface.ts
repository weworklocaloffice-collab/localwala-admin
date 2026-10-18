

export interface PosAndTableOrderCommissionHistoryInterface {
  status: boolean
  createdAt: string
  id: string
  posOrderInfo: PosOrderInfo
  tableOrderInfo: TableOrderInfo
  foodServiceCharge: number
  serviceCharge: number
  orderCommission: number
  totalCommision: number
}

export interface PosOrderInfo {
  id: string
  orderNo: number
  grandTotal?: number
}

export interface TableOrderInfo {
  id: string
  orderNo: number
  grandTotal?: number
}
