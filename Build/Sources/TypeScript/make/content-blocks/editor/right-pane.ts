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
    fieldconfig?: any;
  @property()
    values: Record<string, unknown>;
  schema?: FieldTypeSetting;

  protected render(): TemplateResult {
    if (this.fieldconfig) {
      this.schema = JSON.parse(this.fieldconfig);
      return html `
        <p>Field settings: ${this.schema.type}</p>
        ${this.schema.properties.map( (item) => html` ${this.renderFormFieldset(item)}` )}
      `;
    }
    return html `<p>Field settings: Choose a Field.</p>`;
  }

  protected renderFormFieldset(fieldTypeProperty: FieldTypeProperty): TemplateResult {
    return html `
      <div class="form-group">
        <label for="vendor-prefix">Property '${fieldTypeProperty.name}'</label>
        ${this.renderFormField(fieldTypeProperty)}
      </div>`;
  }

  protected renderFormField(fieldTypeProperty: FieldTypeProperty): TemplateResult {
    switch (fieldTypeProperty.dataType) {
      case 'text':
        return html `<input type="text" id="${fieldTypeProperty.name}" value="${this.values[fieldTypeProperty.name] as string || fieldTypeProperty.default}" class="form-control" />`;
      case 'number':
        return html `<input type="number" id="${fieldTypeProperty.name}" value="${this.values[fieldTypeProperty.name] as number || fieldTypeProperty.default}" class="form-control" />`;
      case 'select':
        return html `<select class="form-control" id="${fieldTypeProperty.name}" >
          <option value="">Choose...</option>
          ${fieldTypeProperty.items.map( (option: FieldTypeItems) => html`
            <option value="${option.value}">${option.label}</option>` )}
        </select>`;
      case 'boolean':
        return html `<input type="checkbox" id="${fieldTypeProperty.name}" ?checked=${this.values[fieldTypeProperty.name] as boolean} value="${fieldTypeProperty.default}" class="form-control" />`;
      case 'textarea':
        return html `<textarea id="${fieldTypeProperty.name}" class="form-control">${fieldTypeProperty.default}</textarea>`;
      default:
        return html `Unknown field type property ${fieldTypeProperty.name}.`;
    }
  }


  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
