

export interface AdminVendorTiffinSubscriptionPackageListInterface {
  name: string
  restaurant: Restaurant
  foods: string[]
  interval: string
  orderTo: string
  available: string
  discountType: string
  translations: Translation2[]
  status: string
  id: string
  totalPurchase: number
  price: number
  discount: number
  displayName: string
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

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

