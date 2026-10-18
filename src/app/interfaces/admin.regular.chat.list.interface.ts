

export interface AdminRegularChatListInterface {
  senderId: string
  receiverId: string
  lastMessage: string
  lastMessageType: string
  updatedAt: string
  senderInfo: SenderInfo
  receiverInfo: ReceiverInfo
  id: string
}

export interface SenderInfo {
  id: string
  firstName: string
  lastName: string
  image: string
}

export interface ReceiverInfo {
  id: string
  firstName: string
  lastName: string
  image: string
}
