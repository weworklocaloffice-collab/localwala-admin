

export interface VendorSubCategoryListInterface {
  name: string
  category: Category
  translations: Translation2[]
  status: boolean
  id: string
  displayName: string
}

export interface Category {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

