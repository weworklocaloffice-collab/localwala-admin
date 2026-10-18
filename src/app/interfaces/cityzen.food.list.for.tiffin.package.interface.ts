

export interface CityzenFoodListForTiffinPackageInterface {
  name: string
  image: string
  addons: Addon[]
  discountType: string
  variations: Variation[]
  translations: Translation2[]
  id: string
  price: number
  discount: number
  displayName: string
}

export interface Addon {
  name: string
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

export interface Variation {
  isRequired: string
  title: string
  type: string
  min: string
  max: string
  options: Option[]
}

export interface Option {
  name: string
  price: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

