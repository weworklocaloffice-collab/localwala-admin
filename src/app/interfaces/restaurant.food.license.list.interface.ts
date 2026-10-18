

export interface RestaurantFoodLicenseListInterface {
  image: string
  name: string
  website: string
  translations: Translation[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

