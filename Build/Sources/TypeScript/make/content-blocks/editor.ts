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
      'identifier': 'text1',
      'label': 'Demo text 1',
      'type': 'Textarea',
      'default': 'default text',
      'placeholder': 'placeholder text',
      'required': false,
      'enableRichtext': true,
      'richtextConfiguration': 'full',
      'rows': 5,
    };

  @property()
    rightPaneActiveSchema: FieldTypeSetting;
  @property()
    rightPaneActivePosition: number;

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
          <div class="col-4">
            <content-block-editor-right-pane
              .schema="${this.rightPaneActiveSchema}"
              .values="${this.fieldSettingsValues}"
              .position="${this.rightPaneActivePosition}"
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
    const newIdentifier = event.detail.data.type + '_' + this.cbDefinition.yaml.fields.length;
    if(this.cbDefinition.yaml.fields.filter((fieldType) => fieldType.identifier === event.detail.data.identifier).length > 0) {
      const existingFieldPosition = this.cbDefinition.yaml.fields.findIndex((fieldType) => fieldType.identifier === event.detail.data.identifier);
      const movedField = this.cbDefinition.yaml.fields[existingFieldPosition];
      const tempFields = [
        ...this.cbDefinition.yaml.fields.slice(0, existingFieldPosition),
        ...this.cbDefinition.yaml.fields.slice(existingFieldPosition + 1)
      ];

      this.cbDefinition.yaml.fields = [
        ...tempFields.slice(0, event.detail.position),
        movedField,
        ...tempFields.slice(event.detail.position)
      ];
      this.fieldSettingsValues = this.cbDefinition.yaml.fields[existingFieldPosition];
      this.rightPaneActivePosition = this.cbDefinition.yaml.fields.findIndex((fieldType) => fieldType.identifier === event.detail.data.identifier);
    } else {
      const newField: ContentBlockField = {
        identifier: newIdentifier,
        type: event.detail.data.type,
        label: event.detail.data.type + this.cbDefinition.yaml.fields.length,
      };
      this.fieldSettingsValues = newField;
      this.cbDefinition.yaml.fields.splice(event.detail.position, 0, newField);
      this.rightPaneActivePosition = event.detail.position;
    }
  }

  protected updateFieldDataEventListener(event: CustomEvent) {
    const clone = structuredClone(this.cbDefinition);
    clone.yaml.fields[event.detail.position] = event.detail.values;
    this.cbDefinition = clone;
    console.log(this.cbDefinition.yaml.fields);
    // this.fieldSettingsValues = clone.yaml.fields[event.detail.position];
    this.fieldSettingsValues = { identifier: '', label: '', type: '' };
    this.requestUpdate();
    this.fieldSettingsValues = event.detail.values;
  }
  protected removeFieldTypeEventListener(event: CustomEvent) {
    const clone = structuredClone(this.cbDefinition);
    clone.yaml.fields.splice(event.detail.position, 1);
    this.cbDefinition = clone;
    console.log(this.cbDefinition.yaml.fields);
    this.fieldSettingsValues = { identifier: '', label: '', type: '' };
    this.rightPaneActiveSchema = null;
  }

  protected activateFieldSettings(event: CustomEvent) {
    this.fieldSettingsValues = this.cbDefinition.yaml.fields.filter((fieldType) => fieldType.identifier === event.detail.identifier)[0] as ContentBlockField;
    this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === this.fieldSettingsValues.type)[0];
    this.rightPaneActivePosition = event.detail.position;
  }

  private handleDragEnd(): void {
    this.dragActive = false;
  }

  private handleDragStart(): void {
    this.dragActive = true;
  }

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
