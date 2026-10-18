

export interface SubscriberListInterface {
  restaurant: Restaurant
  subscriptions: Subscriptions
  trialStartDate?: string
  trialEndDate?: string
  startDate: string
  endDate: string
  status: boolean
  id: string
}

export interface Restaurant {
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
}

export interface Subscriptions {
  id: string
  name: string
  translations: Translation2[]
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescriptions: string
}

