

export interface VendorSupportChatListInterface {
  orders: string
  booking: string
  purchaseSubscription: string
  complaints: string
  reportIssue: string
  restaurantComplaints: string
  supportType: string
  lastMessage: string
  lastMessageType: string
  status: string
  updatedAt: string
  team: Team[]
  id: string
  customer: Customer
}

export interface Team {
  firstName: string
  lastName: string
  image: string
  id: string
}

export interface Customer {
  id: string
  image: string
  firstName: string
  lastName: string
}
