

export interface CityzenFoodListInterface {
  name: string
  image: string
  ownCategory: boolean
  category: Category
  subCategory: SubCategory
  customCategory: CustomCategory
  customSubCategory: CustomSubCategory
  translations: Translation5[]
  restaurants: Restaurants
  id: string
  price: number
  status: string
  inStock: boolean
  rating: number
  totalRating: number
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
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface CustomCategory {
  id: string
  name: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface CustomSubCategory {
  id: string
  name: string
  translations: Translation4[]
  displayName: string
}

export interface Translation4 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Translation5 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface Restaurants {
  id: string
  name: string
  translations: Translation6[]
  displayName: string
}

export interface Translation6 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

