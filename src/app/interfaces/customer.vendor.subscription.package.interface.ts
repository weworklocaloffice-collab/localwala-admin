

export interface CustomerVendorSubscriptionPackageInterface {
  name: string
  price: number
  discount: number
  discountPrice: number
  shortDescriptions: string
  validity: number
  haveTrial: boolean
  trialValidity: number
  icon: string
  pos: boolean
  ownDriver: boolean
  promote: boolean
  customCategory: boolean
  multiOutlet: boolean
  preBooking: boolean
  tableOrder: boolean
  orderLimit: number
  productLimit: number
  translations: Translation[]
  status: boolean
  slug: string
  tiffinSubscription: boolean
  ownWaiter: boolean
  commission: number
  ownKitchen: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescriptions: string
}
