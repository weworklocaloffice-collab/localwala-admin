

export interface UserComplaintsListInterface {
  title: string
  brief: string
  createdAt: string
  issueWith: string
  status: boolean
  reasons: Reasons
  id: string
  userInfo: UserInfo
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

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  countryCode: number
  contactNumber: string
  role: string
}

