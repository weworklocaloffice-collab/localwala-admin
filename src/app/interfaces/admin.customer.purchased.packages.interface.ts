

export interface AdminCustomerPurchasedPackageInterface {
  restaurant: Restaurant
  slot: string
  orderAt: string
  orderTo: string
  totalOrder: number
  ordersDates: string[]
  status: string
  id: string
  grandTotal: number
  package: Package
}

export interface Restaurant {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface Package {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

