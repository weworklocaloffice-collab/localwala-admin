

export interface AdminWithdrawalMethodListInterface {
  name: string
  image: string
  translations: Translation[]
  isDefault: boolean
  status: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

