

export interface CustomerTableOrderCartObjectRequestInterface {
  uuid: string
  addons: string
  food: string
  quantity: number
  variations: CustomerTableOrderCartObjectVariation[]
  instruction: string
}

export interface CustomerTableOrderCartObjectVariation {
  variation: string
  selected: string[]
}
