

export interface AdminLandingPageFeatureBulletPointInterface {
  lbl: string
  displayName: string
  translations: Translation[]
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}
