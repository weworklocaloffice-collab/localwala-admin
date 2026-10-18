

export interface AdminDeliverymanDisbursementReportInterface {
  createdAt: string
  status: string
  id: string
  amount: number
  driverInfo: DriverInfo
  withdrawalMethodDetail: WithdrawalMethodDetail
  deliverymanPayoutMethodDetail: DeliverymanPayoutMethodDetail
  defaultPayoutMethodDetail: DefaultPayoutMethodDetail
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
  role: string
}

export interface WithdrawalMethodDetail {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface DeliverymanPayoutMethodDetail {
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

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

