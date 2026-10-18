

export interface CityzenRestaurantKitchenOwnerListInterface {
  status: boolean
  restaurants: Restaurants
  id: string
  ownerInfo: OwnerInfo
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

export interface OwnerInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}

