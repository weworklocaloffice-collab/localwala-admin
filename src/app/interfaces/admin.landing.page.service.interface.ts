

export interface AdminLandingPageServiceInterface {
  title: string
  subtitle: string
  translations: Translation[]
  displayTitle: string
  displaySubTitle: string
  serial: number
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  subtitle: string
}
