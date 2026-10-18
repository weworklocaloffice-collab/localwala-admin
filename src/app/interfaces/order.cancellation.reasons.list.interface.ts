

export interface OrderCancellationReasonListInterface {
  name: string
  type: string
  translations: Translation[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

