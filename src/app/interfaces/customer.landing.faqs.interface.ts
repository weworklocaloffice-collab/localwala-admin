import { SafeHtml } from "@angular/platform-browser"

export interface CustomerLandingFAQInterface {
  title: string
  subtitle: string
  serial: number
  displayTitle: string
  displaySubTitle: SafeHtml
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  subtitle: string
}
