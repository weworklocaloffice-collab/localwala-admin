

export interface VendorFoodCampaignListInterface {
  title: string
  shortDescription: string
  foods: string[]
  image: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  status: boolean
  id: string
  displayName: string
  displayShortDescription: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

