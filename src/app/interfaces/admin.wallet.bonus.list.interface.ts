

export interface AdminWalletBonusInterface {
  name: string
  shortDescription: string
  image: string
  start: string
  expires: string
  bonusType: string
  translations: Translation[]
  status: boolean
  id: string
  bonusAmount: number
  minWalletAmount: number
  maxBonusAmount: number
  displayName: string
  displayShortDescription: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

