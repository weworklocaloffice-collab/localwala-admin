

export interface VendorAddonListInterface {
  name: string
  price: number
  restaurant: string
  stockType: string
  stockNumber: number
  inStock: boolean
  translations: Translation[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

