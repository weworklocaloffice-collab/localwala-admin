

export interface CustomerSubscriptionPaymentInterface {
  name: string
  slug: string
  image: string
  translations: Translation[]
  isDefault: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
