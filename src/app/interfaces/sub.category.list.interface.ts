

export interface SubCategoryListInterface {
  name: string
  category: Category
  translations: Translation2[]
  status: boolean
  slug: string
  id: string
  displayName: string
}

export interface Category {
  name: string
  image: string
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

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

