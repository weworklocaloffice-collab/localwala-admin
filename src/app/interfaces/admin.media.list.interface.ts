

export interface AdminMediaListInterface {
  path: string
  createdAt: string
  id: string
  userInfo: UserInfo
}

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  role: string
}
