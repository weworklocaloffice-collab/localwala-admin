

export interface VendorFoodListLimitedInterface {
  name: string
  image: string
  addons: any[]
  price: number
  discount: number,
  discountType: string
  restaurant: string
  variations: any[]
  translations: Translation[]
  status: string
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

