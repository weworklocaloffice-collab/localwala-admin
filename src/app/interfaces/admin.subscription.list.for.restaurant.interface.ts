

export interface AdminSubscriptionListForRestaurantInterface {
  name: string
  price: number
  discount: number
  shortDescriptions: string
  validity: number
  haveTrial: boolean
  trialValidity: number
  icon: string
  orderLimit: number
  commission: number
  productLimit: number
  translations: Translation[]
  status: boolean
  slug: string
  customCategory: boolean
  multiOutlet: boolean
  ownDriver: boolean
  pos: boolean
  preBooking: boolean
  promote: boolean
  tableOrder: boolean
  tiffinSubscription: boolean
  ownWaiter: boolean
  ownKitchen: boolean
  id: string
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

// "FB|RJ|2026|ENVATO|FOODBITE|ECITAW15071997"
