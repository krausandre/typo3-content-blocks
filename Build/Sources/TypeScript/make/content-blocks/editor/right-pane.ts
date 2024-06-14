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
// import '@typo3/backend/element/info-box';
import { FieldTypeSetting, FieldTypeProperty, FieldTypeItems } from '@typo3/make/content-blocks/interface/field-type-setting';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-right-pane></content-block-editor-right-pane>
 */
@customElement('content-block-editor-right-pane')
export class ContentBlockEditorRightPane extends LitElement {

  @property()
    values: Record<string, unknown>;

  @property()
    schema?: FieldTypeSetting;

  @property()
    position?: number;

  protected render(): TemplateResult {
    console.log('Render right pane')
    if (this.schema) {
      return html `
        ${this.schema.properties.map( (item) => html` ${this.renderFormFieldset(item)}` )}
      `;
    }
    return html `No field was selected`;
    // return html `
    //   <typo3-infobox
    //     severity="-1"
    //     subject="No field was selected"
    //     content="Please select a field first.">
    //   </typo3-infobox>
    // `;
  }

  protected renderFormFieldset(fieldTypeProperty: FieldTypeProperty): TemplateResult {
    return html `
      <div class="form-group">
        ${fieldTypeProperty.dataType === 'boolean' ? this.renderFormField(fieldTypeProperty) : ''}
        <label for="${fieldTypeProperty.name}" class="${fieldTypeProperty.dataType === 'boolean' ? 'form-check-label fw-bold' : 'form-label'}">Property '${fieldTypeProperty.name}'</label>
        ${fieldTypeProperty.dataType !== 'boolean' ? this.renderFormField(fieldTypeProperty) : ''}
      </div>`;
  }

  protected renderFormField(fieldTypeProperty: FieldTypeProperty): TemplateResult {
    switch (fieldTypeProperty.dataType) {
      case 'text':
        return html `<input @blur="${this.dispatchBlurEvent}" type="text" id="${fieldTypeProperty.name}" value="${this.values[fieldTypeProperty.name] as string || fieldTypeProperty.default || ''}" class="form-control" />`;
      case 'number':
        return html `<input @blur="${this.dispatchBlurEvent}" type="number" id="${fieldTypeProperty.name}" value="${this.values[fieldTypeProperty.name] as number || fieldTypeProperty.default}" class="form-control" />`;
      case 'select':
        return html `<select @blur="${this.dispatchBlurEvent}" class="form-control" id="${fieldTypeProperty.name}" >
          <option value="">Choose...</option>
          ${fieldTypeProperty.items.map( (option: FieldTypeItems) => html`
            <option value="${option.value}">${option.label}</option>` )}
        </select>`;
      case 'boolean':
        return html `<input @blur="${this.dispatchBlurEvent}" type="checkbox" id="${fieldTypeProperty.name}" ?checked=${this.values[fieldTypeProperty.name] as boolean} value="${fieldTypeProperty.default}" class="form-check-input" />`;
      case 'textarea':
        return html `<textarea @blur="${this.dispatchBlurEvent}" id="${fieldTypeProperty.name}" class="form-control">${fieldTypeProperty.default}</textarea>`;
      default:
        return html `Unknown field type property ${fieldTypeProperty.name}.`;
    }
  }

  protected dispatchBlurEvent(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    this.values[target.id] = target.value;
    this.dispatchEvent(new CustomEvent('updateCbFieldData', {
      bubbles: true,
      composed: true,
      detail: {
        position: this.position,
        values: this.values,
      },
    }));
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
