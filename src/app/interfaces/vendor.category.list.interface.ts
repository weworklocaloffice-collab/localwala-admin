

export interface VendorCategoryListInterface {
  name: string
  image: string
  restaurant: string
  translations: Translation[]
  status: boolean
  slug: string
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

