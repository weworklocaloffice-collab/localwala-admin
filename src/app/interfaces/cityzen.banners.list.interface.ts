

export interface CityzenBannersListInterface {
  title: string
  type: string
  restaurant: string
  food: string
  external: string
  image: string
  translations: Translation2[]
  status: boolean
  id: string
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

