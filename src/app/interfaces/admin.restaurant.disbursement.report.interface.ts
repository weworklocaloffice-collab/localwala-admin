

export interface AdminRestaurantDisbursementReportInterface {
  createdAt: string
  restaurant: Restaurant
  status: string
  id: string
  amount: number
  withdrawalMethodDetail: WithdrawalMethodDetail
  restaurantPayoutMethodDetail: RestaurantPayoutMethodDetail
  defaultPayoutMethodDetail: DefaultPayoutMethodDetail
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  cover: string
  address: string
  translations: Translation[]
  displayName: string
  displayAddress: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface WithdrawalMethodDetail {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
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

