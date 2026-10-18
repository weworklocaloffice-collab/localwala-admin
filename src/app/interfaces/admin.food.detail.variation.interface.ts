

export interface AdminFoodDetailVariationInterface {
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
