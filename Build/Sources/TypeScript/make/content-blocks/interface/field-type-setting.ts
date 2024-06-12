export interface FieldTypeOption {
  value: string;
  label: string;
}

export interface FieldTypeProperty {
  name: string;
  dataType: string;
  options?: Array<FieldTypeOption>;
}

export interface FieldTypeSetting {
  icon: string;
  type: string;
  properties: Array<FieldTypeProperty>;
}
