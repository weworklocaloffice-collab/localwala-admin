

export interface AdminWalletTransactionReportInterface {
  type: string
  createdAt: string
  uuid: string
  id: string
  amount: number
  userInfo: UserInfo
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  role: string
  image: string
}
