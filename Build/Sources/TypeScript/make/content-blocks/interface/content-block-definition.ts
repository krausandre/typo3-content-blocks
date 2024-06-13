export interface ContentBlockField {
  identifier: string;
  type: string;
  label: string;
  description?: string;
  useExistingField?: boolean;
  prefixFields?: boolean;
  prefixType?: string;
  displayCond?: string;
  onChange?: string;
  default?: string;
  placeholder?: string;
  required?: boolean;
  enableRichtext?: boolean;
  richtextConfiguration?: string;
  rows?: number;
}

/*interface ContentBlockNumberField extends ContentBlockField {
  type: 'number';
  min: number;
  max: number;
}*/
/*
const fields: Array<ContentBlockField> = [];
fields.map(async (field) => {
  console.log(field.min);

  const fieldHandlerModule = fields.typeImplementations[field.type];
  const fieldHanlder = (await import(fieldHandlerModule)).default;
  if (field.type === 'number') {
    const numberField = field as ContentBlockNumberField;
    console.log(numberField.min);
  }
  return field;
});
*/
export interface ContentBlocksYaml {
  fields: Array<ContentBlockField>;
  //typeImplementations: Record<string, string>;
  group: string;
  name: string;
  prefixFields: boolean;
  prefixType: string;
  table: string;
  typeField: string;
  typeName: string;
  title?: string;
  vendorPrefix?: string;
  priority?: number;

}

export interface ContentBlocksIcon {
  iconPath: string;
  iconProvider: string;
  iconIdentifier: string;
}

export interface ContentBlockDefinition {
  extPath: string;
  hostExtension: string;
  icon: ContentBlocksIcon;
  iconHideInMenu: ContentBlocksIcon;
  name: string;
  yaml: ContentBlocksYaml;
}
