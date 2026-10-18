

export interface VendorMenuPhotosInterface {
  menuDetail: MenuDetail[]
  diningPhotos: string[]
  success: boolean
}

export interface MenuDetail {
  name: string
  translations: Translation[]
  photos: string[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

