

export interface AdminAccountDeleteReasonInterface {
  name: string
  kind: string
  translations: Translation[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

