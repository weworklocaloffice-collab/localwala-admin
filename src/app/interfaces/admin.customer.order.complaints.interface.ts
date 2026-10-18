

export interface AdminCustomerOrderComplaintsInterface {
  title: string
  brief: string
  issueWith: string
  status: boolean
  createdAt: string
  reasons: Reasons
  id: string
}

export interface Reasons {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

