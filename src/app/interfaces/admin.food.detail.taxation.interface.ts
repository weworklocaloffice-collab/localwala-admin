

export interface AdminFoodDetailTaxationInterface {
  taxName: string
  translations: Translation[]
  id: string
  taxAmount: number
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

