

export interface AdminVendorDisbursementListInterface {
  status: string
  createdAt: string
  id: string
  amount: number
  withdrawalMethodDetail: WithdrawalMethodDetail
  restaurantPayoutMethodDetail: RestaurantPayoutMethodDetail
  defaultPayoutMethodDetail: DefaultPayoutMethodDetail
  disbursement: Disbursement
}

export interface WithdrawalMethodDetail {
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
}

export interface RestaurantPayoutMethodDetail {
  id: string
  credential: Credential[]
}

export interface Credential {
  fieldName: string
  fieldType: string
  fieldValue: string
}

export interface DefaultPayoutMethodDetail {
  id: string
  credential: Credential2[]
}

export interface Credential2 {
  fieldName: string
  fieldType: string
  fieldValue: string
}

export interface Disbursement {
  id: string
  disbursementNo: number
}

