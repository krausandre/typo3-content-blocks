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

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import '@typo3/make/content-blocks/editor/left-pane';
import '@typo3/make/content-blocks/editor/middle-pane';
import '@typo3/make/content-blocks/editor/right-pane';
import MultiStepWizard from '@typo3/backend/multi-step-wizard';
import Severity from '@typo3/backend/severity';
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';
import { ContentBlockDefinition, ContentBlockField } from '@typo3/make/content-blocks/interface/content-block-definition';
import { GroupDefinition } from '@typo3/make/content-blocks/interface/group-definition';
import { ExtensionDefinition } from '@typo3/make/content-blocks/interface/extension-definition';

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
    rightPaneActiveParent: number;

  @property()
    dragActive?: boolean = false;
  @property()
    cbDefinition: ContentBlockDefinition;

  init = false;
  fieldTypeList: Array<FieldTypeSetting>;
  groupList: Array<GroupDefinition>;
  extensionList: Array<ExtensionDefinition>;

  protected render(): TemplateResult {
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
              @dragStart="${this.handleDragStart}"
              @dragEnd="${this.handleDragEnd}"
            >
            </content-block-editor-left-pane>
          </div>
          <div class="col-4">
            <content-block-editor-middle-pane
              .fieldList="${this.cbDefinition.yaml.fields}"
              .fieldTypes="${this.fieldTypeList}"
              .dragActive="${this.dragActive}"
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
    this.init = true;

    document.querySelectorAll('[data-action="save-content-block"]').forEach((deleteButton) => {
      deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        console.log(this.cbDefinition.yaml);
        // this.handleRemove(deleteButton.getAttribute('href'));
      });
    });
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected fieldTypeDroppedListener(event: CustomEvent) {
    this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === event.detail.data.type)[0];
    console.log(event.detail);
    if(event.detail.level > 0) {
      const selectedLevel = this.getSelectedLevel(event.detail.level);
      const newIdentifier = event.detail.data.type + '_' + event.detail.parent + '_' + selectedLevel[event.detail.parent].fields.length;
      console.log(selectedLevel);
      console.log(newIdentifier);
      if(selectedLevel.filter((fieldType) => fieldType.identifier === event.detail.data.identifier).length > 0) {
        this.updateContentBlockField(newIdentifier, event.detail.position, selectedLevel);
      } else {
        this.addNewContentBlockField(newIdentifier, event.detail.data.type, event.detail.position + 1, selectedLevel[event.detail.parent].fields);
      }
    } else {
      const newIdentifier = event.detail.data.type + '_' + this.cbDefinition.yaml.fields.length;
      if(this.cbDefinition.yaml.fields.filter((fieldType) => fieldType.identifier === event.detail.data.identifier).length > 0) {
        this.updateContentBlockField(newIdentifier, event.detail.position, this.cbDefinition.yaml.fields);
      } else {
        this.addNewContentBlockField(newIdentifier, event.detail.data.type, event.detail.position, this.cbDefinition.yaml.fields);
      }
    }
  }

  protected addNewContentBlockField(identifier: string, type: string, position: number, fields: ContentBlockField[]): void {
    const newField: ContentBlockField = {
      identifier: identifier,
      type: type,
      label: type + fields.length,
    };
    if (type === 'Collection') {
      newField.fields = [];
    }
    this.fieldSettingsValues = newField;
    fields.splice(position, 0, newField);
    this.rightPaneActivePosition = position;
  }

  protected updateContentBlockField(identifier: string, position: number, fields: ContentBlockField[]): void {
    const existingFieldPosition = fields.findIndex((fieldType) => fieldType.identifier === identifier);
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
    this.fieldSettingsValues = fields[existingFieldPosition];
    this.rightPaneActivePosition = position;
  }

  protected updateFieldDataEventListener(event: CustomEvent) {
    const selectedLevel = this.getSelectedLevel(event.detail.level);
    //const clone = structuredClone(this.cbDefinition);
    selectedLevel[event.detail.position] = event.detail.values;
    this.cbDefinition = structuredClone(this.cbDefinition);
    this.fieldSettingsValues = event.detail.values;
  }
  protected removeFieldTypeEventListener(event: CustomEvent) {
    const selectedLevel = this.getSelectedLevel(event.detail.level);
    selectedLevel.splice(event.detail.position, 1);
    console.log(selectedLevel);
    this.cbDefinition.yaml.fields = structuredClone(this.cbDefinition.yaml.fields);
    this.fieldSettingsValues = { identifier: '', label: '', type: '' };
    // this.rightPaneActiveSchema = null;
  }

  protected activateFieldSettings(event: CustomEvent) {
    const selectedLevel = this.getSelectedLevel(event.detail.level);
    this.fieldSettingsValues = selectedLevel.filter((fieldType) => fieldType.identifier === event.detail.identifier)[0] as ContentBlockField;
    console.log(this.fieldSettingsValues);
    if(this.fieldSettingsValues !== undefined) {
      this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === this.fieldSettingsValues.type)[0];
      this.rightPaneActivePosition = event.detail.position;
      this.rightPaneActiveLevel = event.detail.level;
      this.rightPaneActiveParent = event.detail.parent;
    } else {
      this.rightPaneActiveSchema = null;
      this.rightPaneActivePosition = 0;
      this.rightPaneActiveLevel = 0;
      this.rightPaneActiveParent = 0;
    }
  }

  protected getSelectedLevel(level: number): ContentBlockField[] {
    let currentLevel = 1;
    let selectedLevel: ContentBlockField[] = this.cbDefinition.yaml.fields;
    while(currentLevel < level) {
      selectedLevel = selectedLevel.filter((fieldType) => fieldType.type === 'Collection');
      currentLevel++;
    }
    return selectedLevel;
  }

  private handleDragEnd(): void {
    this.dragActive = false;
  }

  private handleDragStart(): void {
    this.dragActive = true;
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
}
