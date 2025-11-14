/*
* This file is part of the TYPO3 CMS project.
*
* It is free software; you can redistribute it and/or modify it under
* the terms of the GNU General Public License, either version 2
* of the License, or any later version.
*
* For the full copyright and license information, please read the
* LICENSE.txt file that was distributed with this source code.
*
* The TYPO3 project - inspiring people to share!
*/

import { html, LitElement } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@typo3/backend/element/icon-element.js';
import '@friendsoftypo3/content-blocks-gui/editor/left-pane.js';
import '@friendsoftypo3/content-blocks-gui/editor/middle-pane.js';
import '@friendsoftypo3/content-blocks-gui/editor/right-pane.js';
import MultiStepWizard from '@typo3/backend/multi-step-wizard.js';
import Severity from '@typo3/backend/severity.js';
import AjaxRequest from '@typo3/core/ajax/ajax-request.js';
import Modal from '@typo3/backend/modal.js';
import { SeverityEnum } from '@typo3/backend/enum/severity.js';
import type {
  FieldTypeSetting,
  ContentBlockDefinition,
  ContentBlockField,
  DropField,
  GroupDefinition,
  ExtensionDefinition,
  FieldMetadata,
  ValidationResult,
  BasicMetadata
} from '@friendsoftypo3/content-blocks-gui/interface/definitions';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor></content-block-editor>
 */
@customElement('content-block-editor')
export class ContentBlockEditor extends LitElement {

  @property()
    name?: string;
  @property()
    mode?: string;
  @property()
    data?: string;
  @property()
    extensions?: string;
  @property()
    groups?: string;
  @property()
    fieldconfig?: string;
  @property()
    fieldmetadata?: string;

  @property()
    fieldSettingsValues: ContentBlockField = {
      'identifier': '',
      'label': '',
      'type': '',
    };
  @property()
    rightPaneActiveSchema: FieldTypeSetting;
  @property()
    rightPaneActivePosition: number;
  @property()
    rightPaneActiveLevel: number;
  @property()
    rightPaneActiveParent: ContentBlockField;

  @property()
    dragActive?: boolean = false;
  @property()
    cbDefinition: ContentBlockDefinition;

  init = false;
  fieldTypeList: Array<FieldTypeSetting>;
  groupList: Array<GroupDefinition>;
  extensionList: Array<ExtensionDefinition>;
  fieldMetadata: FieldMetadata;

  @state()
  availableBasics: Array<BasicMetadata> = [];

  protected override render(): TemplateResult {
    this.initData();
    if (this.mode === 'copy') {
      this._initMultiStepWizard();
    }
    return html`
        <div class="row">
          <div class="col-4">
            <content-block-editor-left-pane
              .contentBlockYaml="${this.cbDefinition.yaml}"
              .groups="${this.groupList}"
              .extensions="${this.extensionList}"
              .fieldTypes="${this.fieldTypeList}"
              .hostExtension="${this.cbDefinition.hostExtension}"
              .mode="${this.mode}"
              .availableBasics="${this.availableBasics}"
              @dragStart="${this.handleDragStart}"
              @dragEnd="${this.handleDragEnd}"
              @basics-changed="${this.handleBasicsChanged}"
            >
            </content-block-editor-left-pane>
          </div>
          <div class="col-4">
            <content-block-editor-middle-pane
              .fieldList="${this.cbDefinition.yaml.fields}"
              .fieldTypes="${this.fieldTypeList}"
              .dragActive="${this.dragActive}"
              .activeFieldPosition="${this.rightPaneActivePosition}"
              .activeFieldLevel="${this.rightPaneActiveLevel}"
              .activeFieldParent="${this.rightPaneActiveParent}"
              @fieldTypeDropped="${this.fieldTypeDroppedListener}"
              @activateSettings="${this.activateFieldSettings}"
              @removeFieldType="${this.removeFieldTypeEventListener}"
            >
            </content-block-editor-middle-pane>
          </div>
          <div class="col-4 properties-pane p-4 bg-light">
            <content-block-editor-right-pane
              .schema="${this.rightPaneActiveSchema}"
              .values="${this.fieldSettingsValues}"
              .position="${this.rightPaneActivePosition}"
              .level="${this.rightPaneActiveLevel}"
              .parent="${this.rightPaneActiveParent}"
              .fieldTypeList="${this.fieldTypeList}"
              .fieldMetadata="${this.fieldMetadata}"
              .availableBasics="${this.availableBasics}"
              @updateCbFieldData="${this.updateFieldDataEventListener}"
            >
            </content-block-editor-right-pane>
          </div>
        </div>
      `;
  }

  protected initData(): void {
    if (this.init) {
      return;
    }
    this.cbDefinition = JSON.parse(this.data);
    this.fieldTypeList = JSON.parse(this.fieldconfig);
    this.groupList = JSON.parse(this.groups);
    this.extensionList = JSON.parse(this.extensions);
    this.fieldMetadata = JSON.parse(this.fieldmetadata || '{"baseFields":{},"systemReservedFields":[],"currentTable":"tt_content"}');

    // Load available Basics
    this.loadAvailableBasics();

    // Process fields to inject types for base fields
    this.processFieldsForTypeInjection(this.cbDefinition.yaml.fields, 0);

    this.init = true;

    document.querySelectorAll('[data-action="save-content-block"]').forEach((saveButton) => {
      saveButton.addEventListener('click', async (event) => {
        event.preventDefault();
        await this.saveContentBlock();
      });
    });
  }

  /**
   * Load available Basics from the API
   */
  protected async loadAvailableBasics(): Promise<void> {
    try {
      const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_list_basics).get();
      const data = await response.resolve();

      if (data.body && data.body.basicList) {
        // Convert object to array and transform to BasicMetadata format
        this.availableBasics = Object.values(data.body.basicList).map((basic: any) => ({
          identifier: basic.identifier,
          vendor: basic.identifier.split('/')[0] || '',
          name: basic.identifier.split('/')[1] || '',
          fieldCount: basic.fields?.length || 0,
          path: '',
          extension: basic.hostExtension || ''
        }));
      }
    } catch (error) {
      console.error('Failed to load available Basics:', error);
      this.availableBasics = [];
    }
  }

  /**
   * Process fields recursively to inject types for base fields
   * This handles YAML that doesn't have 'type' property for base fields
   */
  protected processFieldsForTypeInjection(fields: ContentBlockField[], level: number): void {
    if (!fields || !Array.isArray(fields)) {
      return;
    }

    fields.forEach((field) => {
      // Check if this is a useExistingField at level 0
      if (field.useExistingField && level === 0 && field.identifier) {
        const baseField = this.fieldMetadata.baseFields[field.identifier];

        if (baseField) {
          // Base field detected
          field._isBaseField = true;

          // FORCE prefixField to false - you can't prefix existing base fields
          field.prefixField = false;
          // Reset prefixType since prefixing is disabled
          field.prefixType = '';

          // Inject type only if missing
          if (!field.type) {
            field.type = baseField.type;
            field._typeInjected = true;
            console.log(`Injected type "${baseField.type}" for base field "${field.identifier}"`);
          }
        }
      }

      // Recursively process nested fields (e.g., Collection fields)
      if (field.fields && Array.isArray(field.fields)) {
        this.processFieldsForTypeInjection(field.fields, level + 1);
      }
    });
  }

  /**
   * Validate a field based on useExistingField rules and context
   */
  protected validateField(field: ContentBlockField, level: number): ValidationResult {
    // Check 1: Collections (level > 0) always need type
    if (level > 0 && !field.type) {
      return {
        valid: false,
        severity: 'error',
        message: 'Type required in collections'
      };
    }

    // Check 2: useExistingField logic (only applies at level 0)
    // This check must come BEFORE system reserved field check, because base fields
    // like 'header' are reusable and should show SUCCESS, not ERROR
    if (level === 0 && field.useExistingField && !field.prefixField) {
      const baseField = this.fieldMetadata.baseFields[field.identifier];

      if (baseField) {
        // Base field detected - type is optional, this is the recommended approach!
        return {
          valid: true,
          severity: 'success',
          message: `Base field - type auto-detected: ${baseField.type}`,
          detectedType: baseField.type
        };
      }

      // Not a base field - check if it's a system reserved field
      if (this.fieldMetadata.systemReservedFields.includes(field.identifier)) {
        return {
          valid: false,
          severity: 'error',
          message: 'System reserved field - enable prefixing or choose different identifier'
        };
      }

      // Custom field (from TCA/Overrides) - type is required
      if (!field.type) {
        return {
          valid: false,
          severity: 'error',
          message: 'Custom field requires type'
        };
      }
      return {
        valid: true,
        severity: 'warning',
        message: 'Custom field - type required'
      };
    }

    // Check 3: System reserved fields without prefixing (for new fields)
    if (!field.prefixField && this.fieldMetadata.systemReservedFields.includes(field.identifier)) {
      return {
        valid: false,
        severity: 'error',
        message: 'System reserved field - enable prefixing or choose different identifier'
      };
    }

    // Check 4: Normal field needs type
    if (!field.type) {
      return {
        valid: false,
        severity: 'error',
        message: 'Type is required'
      };
    }

    return { valid: true, severity: 'info', message: '' };
  }

  /**
   * Prepare fields for save by removing internal properties and injected types
   * Base fields should not have 'type' in YAML
   */
  protected prepareFieldsForSave(fields: ContentBlockField[], level: number): ContentBlockField[] {
    if (!fields || !Array.isArray(fields)) {
      return fields;
    }

    return fields.map((field) => {
      const cleanField = { ...field };

      // Remove internal tracking properties
      delete cleanField._typeInjected;
      delete cleanField._isBaseField;
      delete cleanField._validation;

      // Remove type for base fields at level 0
      if (level === 0 && field._isBaseField && field.useExistingField) {
        delete cleanField.type;
        console.log(`Removed injected type for base field "${field.identifier}"`);
      }

      // Recursively process nested fields
      if (cleanField.fields && Array.isArray(cleanField.fields)) {
        cleanField.fields = this.prepareFieldsForSave(cleanField.fields, level + 1);
      }

      return cleanField;
    });
  }

  protected override createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected fieldTypeDroppedListener(event: CustomEvent) {
    console.log(event.detail);
    this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === event.detail.data.type)[0];
    let newIdentifier = event.detail.data.type + '_' + this.cbDefinition.yaml.fields.length;
    if(event.detail.level > 0) {
      newIdentifier = event.detail.data.type + '_' + event.detail.parent.fields.length;
    }
    this.handleFieldAction(newIdentifier, event.detail);
  }

  protected handleFieldAction(newIdentifier: string, eventData: DropField) {
    let fields = this.cbDefinition.yaml.fields;
    if(eventData.parent !== null) {
      fields = eventData.parent.fields;
    }
    if(fields.filter((fieldType) => fieldType.identifier === eventData.data.identifier).length > 0) {
      this.updateContentBlockField(eventData.data.identifier, eventData.position, eventData.level, eventData.parent);
    } else {
      this.addNewContentBlockField(newIdentifier, eventData.data.type, eventData.position, eventData.level, eventData.parent);
    }
  }

  protected addNewContentBlockField(identifier: string, type: string, position: number, level: number, parent: ContentBlockField): void {
    const newField: ContentBlockField = {
      identifier: identifier,
      type: type,
      label: type + position,
    };
    if (type === 'Collection') {
      newField.fields = [];
    }
    if(level > 0) {
      parent.fields.splice(position, 0, newField);
    } else {
      this.cbDefinition.yaml.fields.splice(position, 0, newField);
    }
    this.fieldSettingsValues = newField;
    this.rightPaneActivePosition = position;
    this.rightPaneActiveLevel = level;
    this.rightPaneActiveParent = parent;

    // Validate the newly created field
    const validation = this.validateField(newField, level);
    newField._validation = validation;
    this.fieldSettingsValues._validation = validation;
  }

  protected updateContentBlockField(identifier: string, position: number, level: number, parent: ContentBlockField): void {
    let fields: ContentBlockField[] = this.cbDefinition.yaml.fields;
    if(parent !== null) {
      fields = parent.fields;
    }
    const existingFieldPosition = fields.findIndex((fieldType: ContentBlockField) => fieldType.identifier === identifier);
    const movedField = fields[existingFieldPosition];
    const tempFields = [
      ...fields.slice(0, existingFieldPosition),
      ...fields.slice(existingFieldPosition + 1)
    ];
    fields = [
      ...tempFields.slice(0, position),
      movedField,
      ...tempFields.slice(position)
    ];
    if(parent !== null) {
      parent.fields = fields;
    } else {
      this.cbDefinition.yaml.fields = fields;
    }
    this.fieldSettingsValues = fields[position];
    this.rightPaneActivePosition = position;
    this.rightPaneActiveLevel = level;
    this.rightPaneActiveParent = parent;
    this.cbDefinition = structuredClone(this.cbDefinition);
  }

  protected updateFieldDataEventListener(event: CustomEvent) {
    console.log(event.detail);
    // Use parent context to get the correct field array
    let fields: ContentBlockField[] = this.cbDefinition.yaml.fields;
    if(event.detail.parent !== null) {
      fields = event.detail.parent.fields;
    }

    // Update field values
    fields[event.detail.position] = event.detail.values;
    this.fieldSettingsValues = event.detail.values;

    // Recalculate _isBaseField and type injection when relevant fields change
    // This ensures the type dropdown enables/disables correctly and validation updates
    const field = event.detail.values;
    if (event.detail.level === 0) {
      if (field.useExistingField && field.identifier) {
        // Check if this identifier is a base field
        const baseField = this.fieldMetadata.baseFields[field.identifier];

        if (baseField) {
          // It's a base field - FORCE prefixField to false (can't prefix existing base fields)
          field.prefixField = false;
          // Reset prefixType since prefixing is disabled
          field.prefixType = '';

          // Mark as base field and inject type if needed
          field._isBaseField = true;
          if (!field.type || field._typeInjected) {
            field.type = baseField.type;
            field._typeInjected = true;
          }
        } else {
          // Not a base field - clear base field marker but KEEP the type
          field._isBaseField = false;
          // Remove the _typeInjected flag but keep the type property itself
          if (field._typeInjected) {
            field._typeInjected = false;
          }
        }
      } else {
        // useExistingField is false - clear base field marker but KEEP the type
        field._isBaseField = false;
        // Remove the _typeInjected flag but keep the type property itself
        if (field._typeInjected) {
          field._typeInjected = false;
        }
      }
    }

    // Validate the field
    const validation = this.validateField(field, event.detail.level);
    field._validation = validation;

    // Clone the entire definition to trigger reactivity
    this.cbDefinition = structuredClone(this.cbDefinition);

    // After cloning, get fresh references to the updated field
    let clonedFields: ContentBlockField[] = this.cbDefinition.yaml.fields;
    if(event.detail.parent !== null) {
      clonedFields = event.detail.parent.fields;
    }
    // Create a shallow copy to ensure a new reference for reactivity
    this.fieldSettingsValues = { ...clonedFields[event.detail.position] };

    // Update the active schema only if type changed explicitly (via dropdown)
    // Don't change schema when we just removed an injected type
    if (event.detail.typeChanged && event.detail.newType) {
      const newSchema = this.fieldTypeList.find(
        (fieldType) => fieldType.type === event.detail.newType
      );
      if (newSchema) {
        this.rightPaneActiveSchema = newSchema;
      }
    } else if (this.fieldSettingsValues.type && !this.rightPaneActiveSchema) {
      // Field has a type but no schema is set - find and set the schema
      const newSchema = this.fieldTypeList.find(
        (fieldType) => fieldType.type === this.fieldSettingsValues.type
      );
      if (newSchema) {
        this.rightPaneActiveSchema = newSchema;
      }
    }
    // Keep existing schema if type was just removed - don't set to null

    // Force re-render to ensure UI updates
    this.requestUpdate();
  }
  protected removeFieldTypeEventListener(event: CustomEvent) {
    let fields: ContentBlockField[] = this.cbDefinition.yaml.fields;
    // TODO: check why parent is set for Collection on level 0
    // if(event.detail.parent !== null) {
    if(event.detail.level > 0) {
      fields = event.detail.parent.fields;
    }
    fields.splice(event.detail.position, 1);
    if(event.detail.level > 0) {
      event.detail.parent.fields = fields;
    } else {
      this.cbDefinition.yaml.fields = fields;
    }
    this.cbDefinition = structuredClone(this.cbDefinition);
    this.fieldSettingsValues = { identifier: '', label: '', type: '' };
    this.rightPaneActiveSchema = null;
  }

  protected activateFieldSettings(event: CustomEvent) {
    let fields: ContentBlockField[] = this.cbDefinition.yaml.fields;
    if(event.detail.parent !== null) {
      fields = event.detail.parent.fields;
    }

    const field = fields[event.detail.position] as ContentBlockField;
    if(field !== undefined) {
      // Apply base field logic when activating a field
      if (event.detail.level === 0 && field.useExistingField && field.identifier) {
        const baseField = this.fieldMetadata.baseFields[field.identifier];

        if (baseField) {
          // It's a base field - FORCE prefixField to false
          field.prefixField = false;
          // Reset prefixType since prefixing is disabled
          field.prefixType = '';
          field._isBaseField = true;

          console.log(`activateFieldSettings: Set field.prefixField = false, field._isBaseField = true for "${field.identifier}"`);

          // Inject type if missing
          if (!field.type || field._typeInjected) {
            field.type = baseField.type;
            field._typeInjected = true;
          }
        }
      }

      // Validate the field when it's activated to show current validation state
      const validation = this.validateField(field, event.detail.level);
      field._validation = validation;

      // Trigger reactivity - clone FIRST
      this.cbDefinition = structuredClone(this.cbDefinition);

      // NOW get fresh references to the cloned objects
      let clonedFields: ContentBlockField[] = this.cbDefinition.yaml.fields;
      if(event.detail.parent !== null) {
        clonedFields = event.detail.parent.fields;
      }

      // Update fieldSettingsValues to point to the CLONED field
      this.fieldSettingsValues = { ...clonedFields[event.detail.position] };

      console.log('activateFieldSettings: fieldSettingsValues after clone:', {
        identifier: this.fieldSettingsValues.identifier,
        prefixField: this.fieldSettingsValues.prefixField,
        _isBaseField: this.fieldSettingsValues._isBaseField
      });

      this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === this.fieldSettingsValues.type)[0];
      this.rightPaneActivePosition = event.detail.position;
      this.rightPaneActiveLevel = event.detail.level;
      this.rightPaneActiveParent = event.detail.parent;

      this.requestUpdate();
    } else {
      this.fieldSettingsValues = { identifier: '', label: '', type: '' };
      this.rightPaneActiveSchema = null;
      this.rightPaneActivePosition = 0;
      this.rightPaneActiveLevel = 0;
      this.rightPaneActiveParent = null;
    }
  }


  private handleDragEnd(): void {
    this.dragActive = false;
  }

  private handleDragStart(): void {
    this.dragActive = true;
  }

  private handleBasicsChanged(event: CustomEvent): void {
    const { basics } = event.detail;
    // Create new yaml object reference so LitElement detects the change
    this.cbDefinition = {
      ...this.cbDefinition,
      yaml: { ...this.cbDefinition.yaml, basics }
    };
  }

  // TODO: add logic and templates to handle a duplicated content block
  private _initMultiStepWizard() {
    // const contentBlockData = this.data;
    MultiStepWizard.addSlide('step-1', 'Step 1', '', Severity.notice, 'Step 1', async function (slide, settings) {
      console.log(settings);
      // contentBlockData.name = 'Test';
      MultiStepWizard.unlockNextStep();
      slide.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>');
    });
    MultiStepWizard.addSlide('step-2', 'Step 2', '', Severity.notice, 'Step 2', async function (slide, settings) {
      console.log(settings);
      slide.html('Test 2');
      MultiStepWizard.unlockPrevStep();
    });
    MultiStepWizard.show();
  }

  /**
   * Recursively remove "enabled" properties from fields structure
   */
  private removeEnabledProperties(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEnabledProperties(item));
    } else if (obj && typeof obj === 'object') {
      const cleaned = { ...obj };
      delete cleaned.enabled;
      
      // Recursively clean nested objects
      for (const key in cleaned) {
        if (cleaned.hasOwnProperty(key)) {
          cleaned[key] = this.removeEnabledProperties(cleaned[key]);
        }
      }
      
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Validate that all field identifiers are unique at the same level
   */
  private validateUniqueIdentifiers(fields: ContentBlockField[]): { isValid: boolean; duplicates: string[] } {
    const duplicates: string[] = [];
    
    const validateLevel = (fieldsAtLevel: ContentBlockField[]): void => {
      const identifierCounts = new Map<string, number>();
      
      for (const field of fieldsAtLevel) {
        if (field.identifier) {
          const count = identifierCounts.get(field.identifier) || 0;
          identifierCounts.set(field.identifier, count + 1);
          
          if (count === 1) {
            duplicates.push(field.identifier);
          }
        }
        
        if (field.fields && field.fields.length > 0) {
          validateLevel(field.fields);
        }
      }
    };
    
    validateLevel(fields);
    
    return {
      isValid: duplicates.length === 0,
      duplicates
    };
  }

  /**
   * Save content block via AJAX
   */
  private async saveContentBlock(): Promise<void> {
    try {
      const saveButtons = document.querySelectorAll('[data-action="save-content-block"]') as NodeListOf<HTMLButtonElement>;
      saveButtons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '<typo3-backend-icon identifier="spinner-circle" size="small"></typo3-backend-icon> Saving...';
      });

      // Clean fields by removing "enabled" properties and injected types recursively
      let cleanedFields = this.removeEnabledProperties(this.cbDefinition.yaml.fields || []);
      cleanedFields = this.prepareFieldsForSave(cleanedFields, 0);

      // Validate unique identifiers before saving
      const validation = this.validateUniqueIdentifiers(cleanedFields);
      if (!validation.isValid) {
        // Re-enable save buttons
        saveButtons.forEach(button => {
          button.disabled = false;
          button.innerHTML = 'Save';
        });

        // Show error message with duplicate identifiers
        Modal.confirm(
          'Duplicate Field Identifiers',
          `The following field identifiers are used multiple times at the same level: ${validation.duplicates.join(', ')}. Please ensure all field identifiers are unique within their respective levels.`,
          SeverityEnum.error,
          [{
            text: 'OK',
            active: true,
            btnClass: 'btn-danger',
            name: 'ok',
            trigger: function() {
                Modal.dismiss();
            }
          }]
        );
        return;
      }

      const saveData = {
        contentType: 'content-element', // TODO: make configurable to support other page-type and record-type
        extension: this.cbDefinition.hostExtension,
        mode: this.mode || 'edit', // Use edit mode by default
        name: this.cbDefinition.yaml.name,
        contentBlock: {
          fields: cleanedFields,
          basics: this.cbDefinition.yaml.basics || [],
          group: this.cbDefinition.yaml.group || 'default',
          prefixField: this.cbDefinition.yaml.prefixField !== false,
          prefixType: this.cbDefinition.yaml.prefixType || 'full',
          table: this.cbDefinition.yaml.table || 'tt_content',
          typeField: this.cbDefinition.yaml.typeField || 'CType',
          priority: this.cbDefinition.yaml.priority || 0,
          title: this.cbDefinition.yaml.title || '',
          vendorPrefix: this.cbDefinition.yaml.vendorPrefix || ''
        }
      };

      if (this.mode === 'copy') {
        // These would need to be provided by the UI for copy operations
        saveData.contentBlock.initialVendor = this.cbDefinition.yaml.initialVendor || '';
        saveData.contentBlock.initialName = this.cbDefinition.yaml.initialName || '';
      }

      const formData = new FormData();
      Object.keys(saveData).forEach(key => {
        if (typeof saveData[key] === 'object') {
          formData.append(key, JSON.stringify(saveData[key]));
        } else {
          formData.append(key, saveData[key]);
        }
      });

      const ajaxUrl = TYPO3.settings.ajaxUrls.content_blocks_gui_save_cb;
      const response = await new AjaxRequest(ajaxUrl)
        .post(formData);

      await response.resolve();
      
      // Show success message
      Modal.confirm(
        'Success',
        'Content block has been saved successfully.',
        SeverityEnum.info,
        [{
          text: 'OK',
          active: true,
          btnClass: 'btn-info',
          name: 'ok',
          trigger: function() {
              Modal.dismiss();
          }
        }]
      );

    } catch (error) {
      console.error('Failed to save content block:', error);
      
      // Show error message
      Modal.confirm(
        'Error',
        'Failed to save content block. Please try again.',
        SeverityEnum.error,
        [{
          text: 'OK',
          active: true,
          btnClass: 'btn-danger',
          name: 'ok',
          trigger: function() {
              Modal.dismiss();
          }
        }]
      );
    } finally {
      // Restore save buttons
      const saveButtons = document.querySelectorAll('[data-action="save-content-block"]') as NodeListOf<HTMLButtonElement>;
      saveButtons.forEach(button => {
        button.disabled = false;
        button.innerHTML = '<typo3-backend-icon identifier="actions-save"></typo3-backend-icon> Save';
      });
    }
  }
}
