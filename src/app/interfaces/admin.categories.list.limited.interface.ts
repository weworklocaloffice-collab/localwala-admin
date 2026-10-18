

export interface AdminCategoriesListLimitedInterface {
  name: string
  translations: Translation[]
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

