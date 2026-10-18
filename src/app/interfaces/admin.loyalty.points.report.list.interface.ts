

export interface AdminLoyaltyPointsReportListInterface {
  orderId: string
  coupon: string
  redeemFrom: string
  redeemedToWallet: boolean
  id: string
  loyaltyPointValue: number
  userInfo: UserInfo
  createdAt: string
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
}
