

export interface CityzenFoodDetailVariationInterface {
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
  stock: string
}
