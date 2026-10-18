

export interface CustomerCuisineInterface {
  name: string
  image: string
  translations: Translation[]
  status: boolean
  slug: string
  id: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
