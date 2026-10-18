

export interface SupportTeamChatListInterface {
  orders: string | null
  booking: string | null
  purchaseSubscription: string | null
  complaints: string | null
  restaurantComplaints: string | null
  reportIssue: string | null
  supportType: string
  status: string
  id: string
  customer: Customer
  updatedAt: string
  team: TeamMember[]
}

export interface Customer {
  id: string
  image: string
  firstName: string
  lastName: string
  contactEmail: string
  countryCode: number
  contactNumber: string
  role: string
}

export interface TeamMember {
  firstName: string
  lastName: string
  image: string
  id: string
}
