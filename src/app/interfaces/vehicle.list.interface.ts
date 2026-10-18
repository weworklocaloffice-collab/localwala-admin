

export interface VehicleListInterface {
  name: string
  extraCharge: number
  minimumCoverage: number
  maximumCoverage: number
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

