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

  position: number;

  protected render(): TemplateResult {
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

      <p>Add your fields here: ${cssClasses}</p>

      <ul class="list-unstyled row ${cssClasses}">
        <li>
          <div id="cb-drop-zone-0"
               class="cb-drop-zone"
               data-position="0"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
        ${this.fieldList.map((item, index) => html`
          ${this.renderFieldArea(item, index + 1 )}
        `)}
      </ul>
    `;
  }

  protected renderFieldArea(cbField: ContentBlockField, position: number): TemplateResult {
    // const fieldType = this.fieldTypes.find( (item) => item.type === cbField.type );
    const fieldType = this.fieldTypes.filter((fieldType) => fieldType.type === cbField.type)[0];
    return html`
      <li>
        <draggable-field-type .fieldTypeSetting="${fieldType}" .fieldTypeInfo="${cbField}"></draggable-field-type>
        <div id="cb-drop-zone-${position}"
             class="cb-drop-zone"
             data-position="${position}"
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
    console.log('Dropped - ');
    this.position = parseInt((event.target as HTMLElement).dataset.position || '0', 10);
    this._dispatchFieldTypeDroppedEvent(event.dataTransfer?.getData('text/plain'));
  }
  protected _dispatchFieldTypeDroppedEvent(type: string): void {
    this.dispatchEvent(new CustomEvent('fieldTypeDropped', {
      detail: {
        type: type,
        position: this.position
      }
    }));
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
