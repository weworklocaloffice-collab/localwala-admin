

export interface PublicBusinssSettingInterface {
  companyName: string
  email: string
  mobile: string
  country: string
  address: string
  timezone: Timezone
  timeFormat: string
  currency: Currency
  currencySide: string
  decimalPoint: number
  cookiesText: string
  vegNonVegOption: boolean
  additionalServiceCharge: boolean
  additionalServiceName: string
  additionalServiceAmount: number
  guestCheckout: boolean
  logo: string
  favicon: string
  maintenance: boolean
  deliveryArea: number
  socialLinks: SocialLinks
}

export interface Timezone {
  value: string
  abbr: string
  offset: string
  isdst: string
  text: string
  utc: string[]
}

export interface Currency {
  cc: string
  symbol: string
  name: string
}

export interface SocialLinks {
  facebook: string
  instagram: string
  x: string
  youtube: string
  linked: string
  pinterest: string
  playstore: string
  appstore: string
  vimeo: string
}
