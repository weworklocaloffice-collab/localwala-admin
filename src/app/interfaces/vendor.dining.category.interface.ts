

export interface VendorDiningCategoryInterface {
  name: string
  image: string
  translations: Translation[]
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

