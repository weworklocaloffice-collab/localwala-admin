

export interface CityzenCashCollectionListInterface {
  from: string
  method: string
  reference: string
  createdAt: string
  id: string
  cashCollected: number
  walletAmount: number
  restaurant: Restaurant
  driverInfo: DriverInfo
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  cover: string
  slug: string
  address: string
  translations: Translation[]
  displayName: string
  displayAddress: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

