

export interface SupportTeamHeaderChatListInterface {
  orders: string
  booking: any
  purchaseSubscription: any
  complaints: any
  reportIssue: any
  restaurantComplaints: any
  supportType: string
  lastMessage: string
  lastMessageType: string
  status: string
  updatedAt: string
  id: string
  customer: Customer
}

export interface Customer {
  id: string
  image: string
  firstName: string
  lastName: string
}
