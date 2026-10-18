

export interface AdminRestaurantFacilitiesInterface {
  name: string
  translations: Translation[]
  status: boolean
  restaurants: number
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

