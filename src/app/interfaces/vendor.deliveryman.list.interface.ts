

export interface VendorDeliverymanListInterface {
  distance: number
  users: Users
  id: string
}

export interface Users {
  id: string
  firstName: string
  lastName: string
  image: string
  role: string
}
