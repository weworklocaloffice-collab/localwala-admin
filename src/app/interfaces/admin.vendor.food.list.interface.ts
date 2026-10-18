

export interface AdminVendorFoodListInterface {
  name: string
  image: string
  ownCategory: boolean
  category: Category
  subCategory: SubCategory
  customCategory: CustomCategory
  customSubCategory: CustomSubCategory
  translations: Translation2[]
  rating: number
  inStock: boolean
  status: string
  id: string
  totalRating: number
  price: number
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

export interface SubCategory {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface CustomCategory {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface CustomSubCategory {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

