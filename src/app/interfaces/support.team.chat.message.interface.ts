

export interface SupportTeamChatMessageInteface {
  roomId: string
  senderId: string
  message: string
  messageType: string
  createdAt: string
  id: string
  sender: Sender
  // Enterprise: bot -> human handover. Optional because the REST projection in
  // support.chat.conversion.service.js omits them for legacy rows.
  senderRole?: 'user' | 'agent' | 'bot' | 'system'
  visibility?: 'public' | 'internal'
  readStatus?: 'sent' | 'delivered' | 'read'
  // True only for a local optimistic echo that the server has not confirmed yet.
  pending?: boolean
}

export interface Sender {
  id: string
  image: string
  firstName: string
  lastName: string
  role: string
}
