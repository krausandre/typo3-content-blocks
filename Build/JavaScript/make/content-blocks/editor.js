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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import '@typo3/make/content-blocks/editor/left-pane';
import '@typo3/make/content-blocks/editor/middle-pane';
import '@typo3/make/content-blocks/editor/right-pane';
import MultiStepWizard from '@typo3/backend/multi-step-wizard';
import Severity from '@typo3/backend/severity';
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';
import { ContentBlockDefinition, ContentBlockField, DropField } from '@typo3/make/content-blocks/interface/content-block-definition';
import { GroupDefinition } from '@typo3/make/content-blocks/interface/group-definition';
import { ExtensionDefinition } from '@typo3/make/content-blocks/interface/extension-definition';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor></content-block-editor>
 */
let ContentBlockEditor = class ContentBlockEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.fieldSettingsValues = {
            'identifier': '',
            'label': '',
            'type': '',
        };
        this.dragActive = false;
        this.init = false;
    }
    render() {
        this.initData();
        if (this.mode === 'copy') {
            this._initMultiStepWizard();
        }
        return html `
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
    initData() {
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
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
    fieldTypeDroppedListener(event) {
        console.log(event.detail);
        this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === event.detail.data.type)[0];
        let newIdentifier = event.detail.data.type + '_' + this.cbDefinition.yaml.fields.length;
        if (event.detail.level > 0) {
            newIdentifier = event.detail.data.type + '_' + event.detail.parent.fields.length;
        }
        this.handleFieldAction(newIdentifier, event.detail);
    }
    handleFieldAction(newIdentifier, eventData) {
        let fields = this.cbDefinition.yaml.fields;
        if (eventData.parent !== null) {
            fields = eventData.parent.fields;
        }
        if (fields.filter((fieldType) => fieldType.identifier === eventData.data.identifier).length > 0) {
            this.updateContentBlockField(eventData.data.identifier, eventData.position, eventData.level, eventData.parent);
        }
        else {
            this.addNewContentBlockField(newIdentifier, eventData.data.type, eventData.position, eventData.level, eventData.parent);
        }
    }
    addNewContentBlockField(identifier, type, position, level, parent) {
        const newField = {
            identifier: identifier,
            type: type,
            label: type + position,
        };
        if (type === 'Collection') {
            newField.fields = [];
        }
        if (level > 0) {
            parent.fields.splice(position, 0, newField);
        }
        else {
            this.cbDefinition.yaml.fields.splice(position, 0, newField);
        }
        this.fieldSettingsValues = newField;
        this.rightPaneActivePosition = position;
        this.rightPaneActiveLevel = level;
        this.rightPaneActiveParent = parent;
    }
    updateContentBlockField(identifier, position, level, parent) {
        let fields = this.cbDefinition.yaml.fields;
        if (parent !== null) {
            fields = parent.fields;
        }
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
        if (parent !== null) {
            parent.fields = fields;
        }
        else {
            this.cbDefinition.yaml.fields = fields;
        }
        this.fieldSettingsValues = fields[existingFieldPosition];
        this.rightPaneActivePosition = position;
        this.rightPaneActiveLevel = level;
        this.rightPaneActiveParent = parent;
        this.cbDefinition = structuredClone(this.cbDefinition);
    }
    updateFieldDataEventListener(event) {
        console.log(event.detail);
        const selectedLevel = this.getSelectedLevel(event.detail.level);
        selectedLevel[event.detail.position] = event.detail.values;
        this.fieldSettingsValues = event.detail.values;
    }
    removeFieldTypeEventListener(event) {
        let fields = this.cbDefinition.yaml.fields;
        // TODO: check why parent is set for Collection on level 0
        // if(event.detail.parent !== null) {
        if (event.detail.level > 0) {
            fields = event.detail.parent.fields;
        }
        fields.splice(event.detail.position, 1);
        if (event.detail.level > 0) {
            event.detail.parent.fields = fields;
        }
        else {
            this.cbDefinition.yaml.fields = fields;
        }
        this.cbDefinition = structuredClone(this.cbDefinition);
        this.fieldSettingsValues = { identifier: '', label: '', type: '' };
        this.rightPaneActiveSchema = null;
    }
    activateFieldSettings(event) {
        console.log(event.detail);
        let fields = this.cbDefinition.yaml.fields;
        if (event.detail.parent !== null) {
            fields = event.detail.parent.fields;
        }
        this.fieldSettingsValues = fields.filter((fieldType) => fieldType.identifier === event.detail.identifier)[0];
        if (this.fieldSettingsValues !== undefined) {
            this.rightPaneActiveSchema = this.fieldTypeList.filter((fieldType) => fieldType.type === this.fieldSettingsValues.type)[0];
            this.rightPaneActivePosition = event.detail.position;
            this.rightPaneActiveLevel = event.detail.level;
            this.rightPaneActiveParent = event.detail.parent;
        }
        else {
            this.rightPaneActiveSchema = null;
            this.rightPaneActivePosition = 0;
            this.rightPaneActiveLevel = 0;
            this.rightPaneActiveParent = null;
        }
    }
    getSelectedLevel(level) {
        let currentLevel = 1;
        let selectedLevel = this.cbDefinition.yaml.fields;
        while (currentLevel < level) {
            selectedLevel = selectedLevel.filter((fieldType) => fieldType.type === 'Collection');
            currentLevel++;
        }
        return selectedLevel;
    }
    handleDragEnd() {
        this.dragActive = false;
    }
    handleDragStart() {
        this.dragActive = true;
    }
    // TODO: add logic and templates to handle a duplicated content block
    _initMultiStepWizard() {
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
};
__decorate([
    property()
], ContentBlockEditor.prototype, "name", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "mode", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "data", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "extensions", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "groups", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "fieldconfig", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "fieldSettingsValues", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "rightPaneActiveSchema", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "rightPaneActivePosition", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "rightPaneActiveLevel", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "rightPaneActiveParent", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "dragActive", void 0);
__decorate([
    property()
], ContentBlockEditor.prototype, "cbDefinition", void 0);
ContentBlockEditor = __decorate([
    customElement('content-block-editor')
], ContentBlockEditor);
export { ContentBlockEditor };
