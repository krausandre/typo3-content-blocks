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

import { html, LitElement, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';


/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <draggable-field-type></draggable-field-type>
 */


@customElement('draggable-field-type')
export class DraggableFieldType extends LitElement {

  static styles = css`  `;

  @property()
    fieldTypeSetting?: FieldTypeSetting;

  protected render(): TemplateResult {
    if (this.fieldTypeSetting) {
      return html`
        <div class="draggable-field-type" draggable="true" @dragstart="${() => { this.handleDragStart(this.fieldTypeSetting.type); }}">
          <div class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </div>
          <span>${this.fieldTypeSetting.type}</span>
        </div>
      `;
    } else {
      return html `<p>No FieldTypeSetting</p>`;
    }
  }

  protected handleDragStart(type: string): void {
    console.log('dispatch DragEnd');
    this.dispatchEvent(new CustomEvent('fetchDragEnd', {
      detail: {
        type: type,
        position: 0,
        targetId: 'cb-drop-zone',
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
