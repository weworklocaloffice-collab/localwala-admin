

export interface VendorNotificationListInterface {
  title: string
  content: string
  username: string
  restaurantName: RestaurantName
  time: string
  driverName: string
  reason: string
  amount: string
  packageName: PackageName
  kind: string
  order: string
  userHelper: boolean
  restaurantHelper: boolean
  timeHelper: boolean
  driverHelper: boolean
  reasonHelper: boolean
  amountHelper: boolean
  packageHelper: boolean
  kindHelper: boolean
  orderHelper: boolean
  translations: Translation3[]
  status: boolean
  id: string
  displayName: string
  displayContent: string
}

export interface RestaurantName {
  location: Location
  _id: string
  name: string
  logo: string
  cover: string
  ownDriver: boolean
  isOutlet: boolean
  outletManagerId: any
  translations: Translation[]
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  address: string
  shortDescription: string
}

export interface PackageName {
  name: string
  translations: Translation2[]
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  title: string
  shortDescription: string
}

export interface Translation3 {
  name: string
  code: string
  nativeName: string
  title: string
  description: string
}
