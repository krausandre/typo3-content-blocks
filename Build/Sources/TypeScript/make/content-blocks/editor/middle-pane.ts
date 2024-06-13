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
import {FieldTypeSetting} from "@typo3/make/content-blocks/interface/field-type-setting";
import { ContentBlockField } from "@typo3/make/content-blocks/interface/content-block-definition";

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

  protected render(): TemplateResult {
    return html`
      <style>
        #cb-drop-zone {
          border: 1px dashed #ccc;
          height: 100px;
          margin: 10px 0;
        }
      </style>

      <p>I am the Middle pane...</p>
      <div id="cb-drop-zone"
            @dragover="${this.handleDragOver}"
            @drop="${this.handleDrop}">
          Drop here to add a new field
      ></div>
    `;
  }

  protected renderFieldArea(cbField: ContentBlockField): TemplateResult {
    return html `

    `;
  }

  protected handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected handleDrop(event: DragEvent): void {
    event.preventDefault();
    console.log('Dropped - ');
    console.log(event);
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
