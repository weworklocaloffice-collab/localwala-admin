

export interface CityzenRestaurantComplaintListInterface {
  title: string
  brief: string
  issueWith: string
  status: boolean
  createdAt: string
  reasons: Reasons
  id: string
  restaurantInfo: RestaurantInfo
}

export interface Reasons {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

export interface RestaurantInfo {
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
  address: string
  shortDescription: string
}

