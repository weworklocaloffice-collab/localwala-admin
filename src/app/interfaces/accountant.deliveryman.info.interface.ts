

export interface AccountantDeliverymanInfoInterface {
  id: string
  driverInfo: DriverInfo
}

export interface DriverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}
