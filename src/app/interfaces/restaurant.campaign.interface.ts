

export interface RestaurantCampaignListInterface {
  title: string
  city: City
  restaurant: string[]
  request: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  translations: Translation2[]
  status: boolean
  id: string
  displayName: string
}

export interface City {
  location: Location
  name: string
  image: string
  translations: Translation[]
  status: boolean
  slug: string
  id: string
  displayName: string
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
}

