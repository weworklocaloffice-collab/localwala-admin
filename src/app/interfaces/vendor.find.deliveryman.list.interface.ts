

export interface VendorFindDeliverymanListInterface {
  type: string
  orderHandling: number
  rating: number
  distance: number
  id: string
  totalRating: number
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
