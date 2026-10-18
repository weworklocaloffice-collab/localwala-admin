

export interface AdminLandingPageAppFeatureInterface {
  image: string
  title: string
  subtitle: string
  translations: Translation[]
  displayTitle: string
  displaySubTitle: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
  subtitle: string
}
