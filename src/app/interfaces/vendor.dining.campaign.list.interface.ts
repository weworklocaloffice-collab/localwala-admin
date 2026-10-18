

export interface VendorDiningCampaignListInterface {
  title: string
  shortDescription: string
  city: City
  restaurant: string[]
  image: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  translations: Translation2[]
  status: boolean
  id: string
  displayName: string
  displayShortDescription: string
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

