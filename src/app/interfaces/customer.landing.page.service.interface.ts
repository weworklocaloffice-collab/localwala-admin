

export interface CustomerLandingPageServiceInterface {
  title: string
  subtitle: string
  serial: number
  displayTitle: string
  displaySubTitle: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  subtitle: string
}
