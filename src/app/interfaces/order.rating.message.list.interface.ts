

export interface OrderRatingMessageListInterface {
  name: string
  type: string
  rateNumber: number
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

