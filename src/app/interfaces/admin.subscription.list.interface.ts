

export interface AdminSubscriptionListInterface {
  name: string
  shortDescriptions: string
  haveTrial: boolean
  icon: string
  pos: boolean
  ownDriver: boolean
  promote: boolean
  customCategory: boolean
  multiOutlet: boolean
  preBooking: boolean
  tableOrder: boolean
  translations: Translation[]
  status: boolean
  slug: string
  tiffinSubscription: boolean
  ownWaiter: boolean
  ownKitchen: boolean
  id: string
  commission: number
  discount: number
  orderLimit: number
  price: number
  productLimit: number
  trialValidity: number
  validity: number
  displayName: string
  displayShortDescription: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescriptions: string
}
