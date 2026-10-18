

export interface PosVariationDetailFoodDialogInterface {
  isRequired: boolean
  title: string
  type: string
  min: number
  max: number
  options: PosVariationOptionFoodDialogInterface[]
}

export interface PosVariationOptionFoodDialogInterface {
  name: string
  price: number
  stock: number
  haveDiscount: boolean
  discountPrice: number
  checked: boolean
  limitCrossed: boolean
  enable: boolean
  inStock: boolean
}
