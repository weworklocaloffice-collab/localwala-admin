

export interface VendorSubscriptionTiffinNoticeInterface {
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

