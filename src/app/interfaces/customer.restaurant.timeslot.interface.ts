

export interface CustomerRestaurantSlotInterface {
  day: number
  times: TimesConfigInterface[]
}

export interface TimesConfigInterface {
  start: string
  end: string
}
