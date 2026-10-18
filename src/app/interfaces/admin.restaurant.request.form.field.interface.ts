

export interface AdminJoiningRequestFormFieldInterface {
  fieldName: string
  fieldType: string
  fieldValue: string
  fieldItems: FieldItem[]
}

export interface FieldItem {
  name: string
  value: boolean
}
