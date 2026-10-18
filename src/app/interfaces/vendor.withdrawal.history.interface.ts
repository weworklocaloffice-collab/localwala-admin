

export interface VendorWithdrawalHistoryInterface {
  rejectedBy: string
  rejectedReason: string
  approvedNotes: string
  proof: string
  formElement: FormElement[]
  status: string
  createdAt: string
  id: string
  amount: number
  withdrawalMethodDetail: WithdrawalMethodDetail
  restaurantPayoutMethodDetail: RestaurantPayoutMethodDetail
}

export interface FormElement {
  fieldName: string
  fieldType: string
  fieldValue: string
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

