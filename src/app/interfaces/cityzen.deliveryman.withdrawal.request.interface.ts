

export interface CityzenDeliverymanWithdrawalRequestInterface {
  deliveryman: Deliveryman
  status: string
  createdAt: string
  id: string
  amount: number
}

export interface Deliveryman {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
  role: string
}
