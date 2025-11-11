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
import { live } from 'lit/directives/live.js';
// import '@typo3/backend/element/info-box';
import { FieldTypeSetting, FieldTypeProperty, FieldTypeItems } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
import '@friendsoftypo3/content-blocks-gui/editor/right-pane-components/value-picker';
import '@friendsoftypo3/content-blocks-gui/editor/right-pane-components/range-selector';

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

  @property()
    level?: number;

  @property()
    parent?: number;


  protected render(): TemplateResult {
    console.log('Render right pane');
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
        ${fieldTypeProperty.dataType === 'boolean' ? html`
          <div class="form-check">
            ${this.renderFormField(fieldTypeProperty)}
            <label for="${fieldTypeProperty.name}" class="form-check-label fw-bold">Property '${fieldTypeProperty.name}'</label>
          </div>
        ` : html`
          <label for="${fieldTypeProperty.name}" class="form-label">Property '${fieldTypeProperty.name}'</label>
          ${this.renderFormField(fieldTypeProperty)}
        `}
      </div>`;
  }

  protected renderFormField(fieldTypeProperty: FieldTypeProperty): TemplateResult {
    // https://lit.dev/docs/templates/directives/#live
    switch (fieldTypeProperty.dataType) {
      case 'text':
        return html `<input @blur="${this.dispatchBlurEvent}" type="text" id="${fieldTypeProperty.name}" .value="${live(this.values[fieldTypeProperty.name] || fieldTypeProperty.default || '')}" class="form-control" />`;
      case 'number':
        return html `<input @blur="${this.dispatchBlurEvent}" type="number" id="${fieldTypeProperty.name}" .value="${live(this.values[fieldTypeProperty.name] as number || fieldTypeProperty.default)}" class="form-control" />`;
      case 'select':
        return html `<select @blur="${this.dispatchBlurEvent}" class="form-control" id="${fieldTypeProperty.name}" >
          <option value="">Choose...</option>
          ${fieldTypeProperty.items.map( (option: FieldTypeItems) => html`
            <option .value="${live(option.value)}">${option.label}</option>` )}
        </select>`;
      case 'boolean':
        return html `<input @blur="${this.dispatchBlurEvent}" type="checkbox" id="${fieldTypeProperty.name}" ?checked=${live(this.values[fieldTypeProperty.name] as boolean || fieldTypeProperty.default)} class="form-check-input" />`;
      case 'textarea':
        return html `<textarea @blur="${this.dispatchBlurEvent}" id="${fieldTypeProperty.name}" class="form-control">${live(fieldTypeProperty.default)}</textarea>`;
      case 'array':
          switch (fieldTypeProperty.name) {
            case 'valuePicker':
                return html`<content-block-editor-value-picker
                  .fieldTypeProperty="${fieldTypeProperty}"
                  .values="${this.values}"
                  .position="${this.position}"
                  .level="${this.level}"
                  .parent="${this.parent}"
                  @updateCbFieldData="${this.dispatchUpdateEvent}">
                </content-block-editor-value-picker>`;
            case 'range':
                return html`<content-block-editor-range-selector
                  .fieldTypeProperty="${fieldTypeProperty}"
                  .values="${this.values}"
                  .position="${this.position}"
                  .level="${this.level}"
                  .parent="${this.parent}"
                  @updateCbFieldData="${this.dispatchUpdateEvent}">
                </content-block-editor-range-selector>`;
              default:
                return html `Array field type for property ${fieldTypeProperty.name} is not yet implemented.`;
          }
      default:
        return html `Unknown field type property ${fieldTypeProperty.name}.`;
    }
  }


  protected dispatchUpdateEvent(): void {
    this.dispatchEvent(new CustomEvent('updateCbFieldData', {
      bubbles: true,
      composed: true,
      detail: {
        position: this.position,
        level: this.level,
        parent: this.parent,
        values: this.values,
      },
    }));
  }

  protected dispatchBlurEvent(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    this.values[target.id] = target.type === 'checkbox' ? target.checked : target.value;
    this.dispatchEvent(new CustomEvent('updateCbFieldData', {
      bubbles: true,
      composed: true,
      detail: {
        position: this.position,
        level: this.level,
        parent: this.parent,
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
