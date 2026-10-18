

export interface AdminCategoriesListInterface {
  name: string
  image: string
  translations: Translation[]
  status: boolean
  slug: string
  id: string
  restaurants: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

