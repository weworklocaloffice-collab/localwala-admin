

export interface CustomerJoiningFormResponseInterface {
  uuid: string
  isRequired: boolean
  type: string
  title: string
  placeholder: string
  items?: Item[]
}

export interface Item {
  name: string
}
