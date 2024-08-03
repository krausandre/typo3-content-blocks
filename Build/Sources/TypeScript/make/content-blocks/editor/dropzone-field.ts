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
import { ContentBlockField } from '@typo3/make/content-blocks/interface/content-block-definition';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <dropzone-field></dropzone>
 */
@customElement('dropzone-field')
export class DropzoneField extends LitElement {

  @property()
    position: number = 0;
  @property()
    level: number = 0;
  @property()
    parent?: ContentBlockField = null;

  protected render(): TemplateResult {
    console.log('Render dropzone')
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
      <div id="cb-drop-zone-${this.position}"
           class="cb-drop-zone"
           @dragover="${this.handleDragOver}"
           @drop="${this.handleDrop}"
      >
      </div>
    `;
  }

  protected handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected handleDrop(event: DragEvent): void {
    event.preventDefault();
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
      },
      bubbles: true,
      composed: true,
    }));
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
