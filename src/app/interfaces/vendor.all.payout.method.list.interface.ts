

export interface VendorAllPayoutMethodListInterface {
  name: string
  image: string
  formElement: FormElement[]
  translations: Translation[]
  isDefault: boolean
  status: boolean
  id: string
  displayName: string
}

export interface FormElement {
  isRequired: string
  fieldType: string
  fieldName: string
  placeholder: string
}

export interface Translation {
  name: string
  code: string
  nativeName: string
  title: string
}

