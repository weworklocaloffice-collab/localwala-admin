

export interface AdminVendorAndDeliverymanPayoutAccountListInterface {
  method: Method
  formElement: FormElement[]
  status: boolean
  id: string
}

export interface Method {
  id: string
  name: string
  translations: Translation[]
  displayName: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

export interface FormElement {
  fieldName: string
  fieldType: string
  fieldValue: string
}

