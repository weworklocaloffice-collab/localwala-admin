

export interface AdminPOSSectionCartItemRequestInterface {
  uuid: string
  addons: string
  food: string
  quantity: number
  variations: POSCartVariationConfig[]
}

export interface POSCartVariationConfig {
  variation: string
  selected: string[]
}
