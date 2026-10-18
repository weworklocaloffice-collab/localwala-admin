

export interface VendorDiningScheduleInterface {
  day: number
  times: Time[]
}

export interface Time {
  type: string
  time: string
}
