

export interface AdminLandingReviewInterface {
  image: string
  userName: string
  occupation: string
  star: number
  message: string
  displayName: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
