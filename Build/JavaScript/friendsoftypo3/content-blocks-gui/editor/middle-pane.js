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
import { html, LitElement, TemplateResult, css } from 'lit';
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
        const cssClasses = this.dragActive ? 'drag-active' : '';
        return html `
      <style>
        .content-block-field-builder {
          min-height: 400px;
          background: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
        }

        .field-builder-container {
          position: relative;
        }

        .initial-dropzone {
          margin-bottom: 0.5rem;
        }

        .fields-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .field-item {
          background: transparant;
        }

        .collection-field {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: #fff;
        }

        .collection-header {
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          border-radius: 4px 4px 0 0;
        }

        .collection-body {
          padding: 1rem;
          background: #fafbfc;
        }

        .collection-fields {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-item.collection-type {
          border-left: 2px solid #007fff;
          padding: 0.75rem;
          background: #fff;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }

        .field-item.collection-type:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .field-item.collection-type .field-with-dropzone .dropzone-wrapper {
          margin-top: 0.75rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 4px;
        }

        .collection-field-item {
          background: transparent;
        }

        .collection-field-item .field-item.collection-type {
          border-left: 2px solid #28a745;
          margin-left: 0.5rem;
        }

        .collection-footer {
          border-top: 1px solid #dee2e6;
          background: #f8f9fa;
        }

        .field-component {
          position: relative;
        }

        .field-with-dropzone .field-wrapper {
          position: relative;
        }

        .field-with-dropzone .dropzone-wrapper {
          margin-top: 0.5rem;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
        }

        .empty-state-content {
          color: #6c757d;
        }

        .empty-state-content h4 {
          margin: 1rem 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .empty-state-content p {
          margin: 0;
          font-size: 0.875rem;
        }

        .drag-active {
          background: #e3f2fd !important;
          border: 2px dashed #2196f3 !important;
        }

        .drag-active .field-item {
          opacity: 0.7;
        }

        .standard-field {
          position: relative;
        }

        [data-level="1"] {
          margin-left: 0.5rem;
        }

        [data-level="2"] {
          margin-left: 1rem;
        }

        [data-level="3"] {
          margin-left: 1.5rem;
        }
      </style>
      <div class="content-block-field-builder ${cssClasses}">
        <div class="field-builder-container">
          <div class="initial-dropzone">
            <dropzone-field position="0" level="0"></dropzone-field>
          </div>
          <div class="fields-list">
            ${this.fieldList?.map((item, index) => html `
              <div class="field-item ${item.type === 'Collection' ? 'collection-type' : ''}" data-field-index="${index}">
                ${this.renderFieldArea(item, index + 1, 0, null)}
              </div>
            `)}
          </div>
          ${this.fieldList?.length === 0 ? html `
            <div class="empty-state">
              <div class="empty-state-content">
                <typo3-backend-icon identifier="content-elements-container" size="large"></typo3-backend-icon>
                <h4>No fields added yet</h4>
                <p>Drag field types from the left panel to start building your content block.</p>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    }
    renderFieldArea(cbField, position, level, parent) {
        const fieldType = this.fieldTypes?.filter((fieldType) => fieldType.type === cbField.type)[0];
        if (cbField.type === 'Collection') {
            return html `
        <div class="collection-field" data-level="${level}">
          <div class="collection-header">
            ${this.renderDraggableFieldType(fieldType, cbField, position, level, cbField, true, false)}
          </div>
          <div class="collection-body">
            <div class="collection-fields">
              <div class="collection-initial-dropzone">
                ${this.renderDraggableFieldType(fieldType, cbField, 0, level + 1, cbField, false, true)}
              </div>
              ${cbField.fields?.map((field, index) => html `
                <div class="collection-field-item" data-field-index="${index}">
                  <div class="field-item ${field.type === 'Collection' ? 'collection-type' : ''}" data-field-index="${index}">
                    ${this.renderFieldArea(field, index + 1, level + 1, cbField)}
                  </div>
                </div>
              `)}
            </div>
          </div>
          <div class="collection-footer">
            ${this.renderDraggableFieldType(fieldType, cbField, position, level, cbField, false, true)}
          </div>
        </div>
      `;
        }
        else {
            return html `
        <div class="standard-field" data-level="${level}">
          ${this.renderDraggableFieldType(fieldType, cbField, position, level, parent)}
        </div>
      `;
        }
    }
    renderDraggableFieldType(fieldType, fieldTypeInfo, position, level, parent, renderLabel = true, renderDropZone = true) {
        if (renderLabel && !renderDropZone) {
            return html `
        <div class="field-component field-only">
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position}"
            .level="${level}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
        </div>
      `;
        }
        if (!renderLabel && renderDropZone) {
            return html `
        <div class="field-component dropzone-only">
          <dropzone-field .position="${position}" .level="${level}" .parent="${parent}"></dropzone-field>
        </div>
      `;
        }
        return html `
      <div class="field-component field-with-dropzone">
        <div class="field-wrapper">
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position}"
            .level="${level}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
        </div>
        <div class="dropzone-wrapper">
          <dropzone-field .position="${position}" .level="${level}" .parent="${parent}"></dropzone-field>
        </div>
      </div>
    `;
    }
    handleDragOver(event) {
        event.preventDefault();
        // Visual feedback for drag over
        const target = event.target;
        const dropzone = target.closest('.cb-drop-zone, dropzone-field');
        if (dropzone) {
            dropzone.classList.add('drag-over');
        }
    }
    handleDragLeave(event) {
        // Remove visual feedback when leaving
        const target = event.target;
        const dropzone = target.closest('.cb-drop-zone, dropzone-field');
        if (dropzone) {
            dropzone.classList.remove('drag-over');
        }
    }
    handleDrop(event) {
        event.preventDefault();
        // Remove visual feedback
        const target = event.target;
        const dropzone = target.closest('.cb-drop-zone, dropzone-field');
        if (dropzone) {
            dropzone.classList.remove('drag-over');
        }
        // Extract position data from the closest dropzone element
        this.position = parseInt(event.target.dataset.position || '0', 10);
        this.level = parseInt(event.target.dataset.level || '0', 10);
        this.parent = event.target.dataset.parent;
        const dragData = event.dataTransfer?.getData('text/plain');
        if (dragData) {
            this._dispatchFieldTypeDroppedEvent(dragData);
        }
    }
    _dispatchFieldTypeDroppedEvent(data) {
        try {
            const dataObject = JSON.parse(data);
            this.dispatchEvent(new CustomEvent('fieldTypeDropped', {
                bubbles: true,
                composed: true,
                detail: {
                    data: dataObject,
                    position: this.position,
                    level: this.level,
                    parent: this.parent,
                }
            }));
        }
        catch (error) {
            console.error('Failed to parse drag data:', error);
        }
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
