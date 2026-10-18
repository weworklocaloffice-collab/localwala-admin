

export interface AdminVendorWaiterListInterface {
  rating: number
  status: boolean
  id: string
  waiterInfo: WaiterInfo
}

export interface WaiterInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}
