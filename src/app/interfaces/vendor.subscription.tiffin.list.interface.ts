

export interface VendorSubscriptionTiffinListInterface {
  name: string
  image: string
  foods: string[]
  interval: string
  orderTo: string
  available: string
  discountType: string
  translations: Translation[]
  status: string
  id: string
  price: number
  discount: number
  totalPurchase: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

