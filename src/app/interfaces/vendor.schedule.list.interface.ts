

export interface VendorScheduleListInterface {
  day: number
  times: TimeInterfaceOfSchedule[]
}

export interface TimeInterfaceOfSchedule {
  start: string
  end: string
}
