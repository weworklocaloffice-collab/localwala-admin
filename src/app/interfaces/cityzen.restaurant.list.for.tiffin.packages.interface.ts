

export interface CityzenRestaurantListForTiffinPackagesInterface {
  name: string
  logo: string
  cover: string
  locality: RestaurantLocality
  translations: Translation2[]
  id: string
  ownerInfo: OwnerInfo
  displayName: string
}

export interface RestaurantLocality {
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

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
}

export interface OwnerInfo {
  id: string
  firstName: string
  lastName: string
}

