

export interface CityzenCouponListInterface {
  name: string
  start: string
  expires: string
  redeem: number
  couponType: string
  translations: Translation2[]
  status: string
  id: string
  displayName: string
}

export interface Translation2 {
  name: string
  code: string
  nativeName: string
  value: string
}

