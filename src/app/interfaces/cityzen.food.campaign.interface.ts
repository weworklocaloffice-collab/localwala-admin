

export interface CityzenFoodCampaignListInterface {
  title: string
  foods: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  translations: Translation2[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
}

