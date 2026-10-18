

export interface CityzenFoodTaxationInfoInterface {
  restaurant: string
  taxName: string
  taxAmount: number
  translations: Translation[]
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

