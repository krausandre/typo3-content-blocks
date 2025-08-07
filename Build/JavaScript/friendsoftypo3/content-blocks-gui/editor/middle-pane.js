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
import '@friendsoftypo3/content-blocks-gui/editor/dropzone-field';
import { FieldTypeSetting, ContentBlockField } from '@friendsoftypo3/content-blocks-gui/interface/definitions';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-middle-pane></content-block-editor-middle-pane>
 */
let ContentBlockEditorMiddlePane = class ContentBlockEditorMiddlePane extends LitElement {
    render() {
        console.log('Render middle pane');
        let cssClasses = '';
        if (this.dragActive) {
            cssClasses = 'drag-active';
        }
        return html `
      <ul class="list-unstyled row ${cssClasses}">
        <li>
          <dropzone-field position="0" level="0"></dropzone-field>
        </li>
        ${this.fieldList.map((item, index) => html `
          ${this.renderFieldArea(item, index + 1, 0, null)}
        `)}
      </ul>
      <pre>
        ${cssClasses}
      </pre>
    `;
    }
    renderFieldArea(cbField, position, level, parent) {
        const fieldType = this.fieldTypes.filter((fieldType) => fieldType.type === cbField.type)[0];
        if (cbField.type === 'Collection') {
            return html `
        ${this.renderDraggableFieldType(fieldType, cbField, position, level, cbField, true, false)}
        <li>
          <ul>
            ${this.renderDraggableFieldType(fieldType, cbField, 0, level + 1, cbField, false, true)}
            ${cbField.fields?.map((field, index) => html `
              ${this.renderFieldArea(field, index + 1, level + 1, cbField)}
            `)}
          </ul>
        </li>
        ${this.renderDraggableFieldType(fieldType, cbField, position, level, cbField, false, true)}
      `;
        }
        else {
            return this.renderDraggableFieldType(fieldType, cbField, position, level, parent);
        }
    }
    renderDraggableFieldType(fieldType, fieldTypeInfo, position, level, parent, renderLabel = true, renderDropZone = true) {
        if (renderLabel && !renderDropZone) {
            return html `
        <li>
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position}"
            .level="${level}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
        </li>
      `;
        }
        if (!renderLabel && renderDropZone) {
            return html `
        <li>
          <dropzone-field .position="${position}" .level="${level}" .parent="${parent}"></dropzone-field>
        </li>
      `;
        }
        return html `
        <li>
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position}"
            .level="${level}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
          <dropzone-field .position="${position}" .level="${level}" .parent="${parent}"></dropzone-field>
        </li>
      `;
    }
    handleDragOver(event) {
        event.preventDefault();
    }
    handleDrop(event) {
        event.preventDefault();
        this.position = parseInt(event.target.dataset.position || '0', 10);
        this.level = parseInt(event.target.dataset.level || '0', 10);
        this.parent = event.target.dataset.parent;
        this._dispatchFieldTypeDroppedEvent(event.dataTransfer?.getData('text/plain'));
    }
    _dispatchFieldTypeDroppedEvent(data) {
        const dataObject = JSON.parse(data);
        this.dispatchEvent(new CustomEvent('fieldTypeDropped', {
            detail: {
                data: dataObject,
                position: this.position,
                level: this.level,
                parent: this.parent,
            }
        }));
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "fieldList", void 0);
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "fieldTypes", void 0);
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "dragActive", void 0);
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorMiddlePane.prototype, "parent", void 0);
ContentBlockEditorMiddlePane = __decorate([
    customElement('content-block-editor-middle-pane')
], ContentBlockEditorMiddlePane);
export { ContentBlockEditorMiddlePane };
