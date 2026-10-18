

export interface AccountantDeliverymanDisbursementReportListInterface {
  status: string
  createdAt: string
  defaultPayoutMethodDetail: DefaultPayoutMethodDetail
  id: string
  amount: number
  disbursement: Disbursement
  driverInfo: DriverInfo
  withdrawalMethodDetail: WithdrawalMethodDetail
  deliverymanPayoutMethodDetail: DeliverymanPayoutMethodDetail
  defaultPayoutMethodDetailInfo: DefaultPayoutMethodDetailInfo
}

export interface DefaultPayoutMethodDetail {
  id: string
  credential: Credential[]
}

export interface Credential {
  fieldName: string
  fieldType: string
  fieldValue: string
}

export interface Disbursement {
  id: string
  disbursementNo: number
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  role: string
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

export interface DeliverymanPayoutMethodDetail {
  id: string
  credential: Credential2[]
}

export interface Credential2 {
  fieldName: string
  fieldType: string
  fieldValue: string
}

export interface DefaultPayoutMethodDetailInfo {
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

