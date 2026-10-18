

export interface AdminRegularChatConversionInterface {
  roomId: string
  senderId: string
  message: string
  messageType: string
  createdAt: string
  id: string
  sender: Sender
}

export interface Sender {
  id: string
  image: string
  firstName: string
  lastName: string
  role: string
}
