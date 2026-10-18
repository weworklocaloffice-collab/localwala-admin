

export interface AdminCityMasterInterface {
  firstName: string
  lastName: string
  image: string
  countryCode: number
  city: City
  status: boolean
  createdAt: string
  id: string
  contactNumber: string
  contactEmail: string
}

export interface City {
  id: string
  name: string
  slug: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  value: string
}

