

export interface PosAddonDetailFoodDialogInterface {
  name: string
  translations: Translation[]
  id: string
  price: number
  inStock: boolean
  stockNumber: number
  stockType: string
  haveDiscount: boolean
  discountPrice: number
  checked: boolean
  limitCrossed: boolean
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

