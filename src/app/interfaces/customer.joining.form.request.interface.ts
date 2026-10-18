

export interface CustomerJoiningFormRequestInterface {
  uuid: string;
  isRequired: boolean;
  type: string;
  title: string;
  placeholder: string;
  value: string;
  extraValue: string;
  fileURL: any;
  fileTarget: any;
  items: CustomerJoiningFormChecboxItemInterface[];
}

export interface CustomerJoiningFormChecboxItemInterface {
  name: string;
  value: boolean;
}
