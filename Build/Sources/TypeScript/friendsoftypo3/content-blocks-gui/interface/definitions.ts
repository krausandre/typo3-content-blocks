import type { FieldTypeItems } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
import type { ValuePicker, Range } from '@friendsoftypo3/content-blocks-gui/interface/content-block-definition';
export interface ExtensionDefinition {
    vendor: string;
    package: string;
    extension: string;
    icon: string;
}

// TODO: how to handle dynamic properties?
export interface FieldTypeItems {
    label: string;
    value?: string;
    labelChecked?: string;
    labelUnchecked?: string;
    invertStateDisplay?: boolean;
    lower?: number;
    upper?: number;
    step?: number;
    width?: number;
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

export interface GroupDefinition {
    key: string;
    label: string
}

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
    relationship?: string;
    maxitems?: number;
    minitems?: number;
    items?: Array<FieldTypeItems>;
    renderType?: string;
    allowedCustomProperties?: Array<FieldTypeItems>;
    format?: string;
    range?: Range;
    slider?: Array<FieldTypeItems>;
    size?: number;
    valuePicker?: ValuePicker;
    allowedTypes?: Array<FieldTypeItems>;
    ignoreIfNotInPalette?: boolean;
    fields?: Array<ContentBlockField>;
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

export interface DropField {
    data: {
        identifier: string,
        type: string
    },
    position: number,
    level: number,
    parent?: ContentBlockField
}

