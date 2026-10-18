

export interface BannerFoodListInterface {
  name: string
  translations: Translation[]
  restaurants: BannerRestaurant
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface BannerRestaurant {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

