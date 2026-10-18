

export interface CustomerLandingPageAppFeatureInterface {
  title: string
  subtitle: string
  image: string
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
