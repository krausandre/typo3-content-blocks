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
import { ContentBlockField } from '@typo3/make/content-blocks/interface/content-block-definition';


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

  @property()
    fieldTypeInfo?: ContentBlockField;

  @property()
    identifierIndex?: number = 0;

  @property()
    position?: number = 0;
  @property()
    showDeleteButton?: boolean = false;

  protected render(): TemplateResult {
    if (this.fieldTypeSetting) {
      let identifier: string = this.fieldTypeSetting.type + '_' + this.identifierIndex;
      let renderLabel: string = this.fieldTypeSetting.type;
      if (this.fieldTypeInfo) {
        identifier = this.fieldTypeInfo.identifier;
        renderLabel = identifier + ' (' + renderLabel + ')';
      }
      let deleteButton = html` `;
      if(this.showDeleteButton) {
        deleteButton = html`<div class="delete-icon-wrap" @click="${() => { this.removeFieldType() }}">
            <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
          </div>`;
      }

      return html`
        ${deleteButton}
        <div class="draggable-field-type d-flex gap-2 text-start btn btn-default d-block mb-3 justify-content-start"
             draggable="true"
             @dragstart="${(event: DragEvent) => { this.handleDragStart(event, this.fieldTypeSetting.type, identifier); }}"
             data-identifier="${identifier}"
             @click="${() => { this.activateSettings(identifier) }}" @dragend="${ () => {this.handleDragEnd()} }"
        >
          <span class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </span>
          <span>${renderLabel}</span>
        </div>
      `;
    } else {
      return html `<p>No FieldTypeSetting</p>`;
    }
  }

  protected handleDragStart(event: DragEvent, type: string, identifier: string): void {
    const data = {
      type: type,
      identifier: identifier,
    };
    event.dataTransfer?.setData('text/plain', JSON.stringify(data));
    this.dispatchEvent(new CustomEvent('dragStart', {
      bubbles: true,
      composed: true,
    }));
  }

  protected handleDragEnd(): void {
    this.dispatchEvent(new CustomEvent('dragEnd', {
      bubbles: true,
      composed: true,
    }));
  }

  protected activateSettings(identifier: string): void {
    if (this.fieldTypeInfo) {
      this.dispatchEvent(new CustomEvent('activateSettings', {
        detail: {
          identifier: identifier,
          position: this.position,
        },
        bubbles: true,
        composed: true,
      }));
    }
  }
  protected removeFieldType(): void {
    this.dispatchEvent(new CustomEvent('removeFieldType', {
      detail: {
        position: this.position,
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
