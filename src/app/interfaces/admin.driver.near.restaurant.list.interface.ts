

export interface AdminDriverNearRestaurantListInterface {
  type: string
  orderHandling: number
  rating: number
  totalRating: number
  distance: number
  id: string
  driverInfo: DriverInfo
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  mobile: string
}
