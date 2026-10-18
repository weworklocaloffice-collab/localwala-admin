

export interface CityzenFoodTaxationListInterface {
  taxes: Tax[]
  restaurant_id: string
  restaurant_name: string
  restaurant_address: string
  restaurant_logo: string
  restaurant_cover: string
  restaurant_translations: RestaurantTranslation[]
}

export interface Tax {
  id: string
  taxName: string
  taxAmount: number
  tax_translations: TaxTranslation[]
}

export interface TaxTranslation {
  name: string
  code: string
  nativeName: string
  title: string
}

export interface RestaurantTranslation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}
