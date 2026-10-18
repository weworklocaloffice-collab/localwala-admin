

export interface AdminWaiterListInterface {
  rating: number
  status: boolean
  restaurants: Restaurants
  id: string
  waiterInfo: WaiterInfo
}

export interface Restaurants {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface WaiterInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

