export interface FieldTypeItems {
  value: string;
  label: string;
}

export interface FieldTypeProperty {
  name: string;
  dataType: string;
  required?: boolean;
  default?: string;
  items?: Array<FieldTypeItems>;
}

export interface FieldTypeSetting {
  icon: string;
  type: string;
  properties: Array<FieldTypeProperty>;
}
