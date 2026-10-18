

export interface CityzenDeliverymanJoiningRequestInterface {
  firstName: string
  lastName: string
  countryCode: number
  locality: Locality
  cover: string
  type: string
  status: string
  createdAt: string
  contactNumber: string
  contactEmail: string
  id: string
  vehicleInfo: VehicleInfo
}

export interface Locality {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface VehicleInfo {
  id: string
  name: string
  translations: Translation3[]
  displayName: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  value: string
}

