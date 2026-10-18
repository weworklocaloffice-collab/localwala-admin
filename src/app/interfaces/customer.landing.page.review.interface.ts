

export interface CustoemrLandingPageReviewInterface {
  image: string
  message: string
  occupation: string
  star: number
  userName: string
  displayMessage: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
