

export interface DiningCampaignListInterface {
  title: string
  city: City
  restaurant: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  translations: Translation2[]
  status: boolean
  id: string
  request: number
  displayName: string
}

export interface City {
  id: string
  name: string
  slug: string
  translations: Translation[]
  displayName: string
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
  shortDescription: string
}

