

export interface CityzenHeaderSupportChatListInterface {
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
  id: string
  customer: Customer
}

export interface Customer {
  id: string
  image: string
  firstName: string
  lastName: string
}
