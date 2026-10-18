

export interface AdminSubCategoryListInterface {
  name: string
  category: Category
  image: string
  translations: Translation2[]
  status: boolean
  slug: string
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

