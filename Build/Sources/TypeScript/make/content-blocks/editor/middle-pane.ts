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
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';
import { ContentBlockField } from '@typo3/make/content-blocks/interface/content-block-definition';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-middle-pane></content-block-editor-middle-pane>
 */
@customElement('content-block-editor-middle-pane')
export class ContentBlockEditorMiddlePane extends LitElement {

  @property()
    fieldList?: Array<ContentBlockField>;
  @property()
    fieldTypes: Array<FieldTypeSetting>;
  @property()
    dragActive: boolean;
  @property()
    position: number;
  @property()
    level: number;
  @property()
    parent: number;

  protected render(): TemplateResult {
    console.log('Render middle pane')
    let cssClasses = '';
    if (this.dragActive) {
      cssClasses = 'drag-active';
    }
    return html`
      <style>
        .cb-drop-zone {
          border: 1px dashed #ccc;
          height: 20px;
          margin: 10px 0;
          background-color: #f9f9f9;

          &:focus {
            background-color: #cbffdb;
          }
        }
      </style>
      <ul class="list-unstyled row ${cssClasses}">
        <li>
          <div id="cb-drop-zone-0"
               class="cb-drop-zone"
               data-position="0"
               data-level="0"
               data-parent="0"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
        ${this.fieldList.map((item, index) => html`
          ${this.renderFieldArea(item, index + 1 , 0, 0)}
        `)}
      </ul>
      <pre>
        ${cssClasses}
      </pre>
    `;
  }

  protected renderFieldArea(cbField: ContentBlockField, position: number, level: number, parent: number): TemplateResult {
    const fieldType = this.fieldTypes.filter((fieldType) => fieldType.type === cbField.type)[0];
    if(cbField.type === 'Collection') {
      return html`
        ${this.renderDraggableFieldType(fieldType, cbField, position, level, parent, true, false)}
        <li>
          <ul>
            ${this.renderDraggableFieldType(fieldType, cbField, 0, level + 1, position - 1, false, true)}
            ${cbField.fields?.map((field, index) => html`
              ${this.renderFieldArea(field, index + 1, level + 1, position - 1)}
            `)}
          </ul>
        </li>
        ${this.renderDraggableFieldType(fieldType, cbField, position, level, parent, false, true)}
      `;
    } else {
      return this.renderDraggableFieldType(fieldType, cbField, position, level, parent);
    }
  }

  protected renderDraggableFieldType(
    fieldType: FieldTypeSetting,
    fieldTypeInfo: ContentBlockField,
    position: number,
    level: number,
    parent: number,
    renderLabel: boolean = true,
    renderDropZone: boolean = true
  ): TemplateResult {
    if(renderLabel && !renderDropZone) {
      return html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position - 1}"
            .level="${level + 1}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
        </li>
      `;
    }
    if(!renderLabel && renderDropZone) {
      return html`
        <li>
          <div id="cb-drop-zone-${position}-${level}-${parent}"
             class="cb-drop-zone"
             data-position="${position}"
             data-level="${level}"
             data-parent="${parent}"
             @dragover="${this.handleDragOver}"
             @drop="${this.handleDrop}">
          </div>
        </li>
      `;
    }
    return html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${fieldType}"
            .fieldTypeInfo="${fieldTypeInfo}"
            .position="${position - 1}"
            .level="${level + 1}"
            .parent="${parent}"
            showDeleteButton="true"
          ></draggable-field-type>
          <div id="cb-drop-zone-${position}-${level}-${parent}"
               class="cb-drop-zone"
               data-position="${position}"
               data-level="${level}"
               data-parent="${parent}"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
      `;
  }

  protected handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.position = parseInt((event.target as HTMLElement).dataset.position || '0', 10);
    this.level = parseInt((event.target as HTMLElement).dataset.level || '0', 10);
    this.parent = parseInt((event.target as HTMLElement).dataset.parent || '0', 10);
    this._dispatchFieldTypeDroppedEvent(event.dataTransfer?.getData('text/plain'));
  }
  protected _dispatchFieldTypeDroppedEvent(data: string): void {
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

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

}
