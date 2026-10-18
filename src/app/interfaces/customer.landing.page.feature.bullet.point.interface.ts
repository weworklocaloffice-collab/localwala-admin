

export interface CustomerLandingPageFeatureBulletPointInterface {
  lbl: string
  displayTitle: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
