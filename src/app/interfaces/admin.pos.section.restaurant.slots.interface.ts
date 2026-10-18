

export interface AdminPOSSectionRestaurantSlotsInterface {
  day: number
  times: TimesConfigInterface[]
}

export interface TimesConfigInterface {
  start: string
  end: string
}
