

export interface VendorKitchenOwnerListInterface {
  status: boolean
  id: string
  ownerInfo: OwnerInfo
}

export interface OwnerInfo {
  id: string
  firstName: string
  lastName: string
  image: string
  countryCode: number
  contactNumber: string
  contactEmail: string
}
