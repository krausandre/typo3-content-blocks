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
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import { live } from 'lit/directives/live.js';
// import '@typo3/backend/element/info-box';
import { FieldTypeSetting, FieldTypeProperty, FieldTypeItems } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
import '@friendsoftypo3/content-blocks-gui/editor/right-pane-components/value-picker';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-right-pane></content-block-editor-right-pane>
 */
let ContentBlockEditorRightPane = class ContentBlockEditorRightPane extends LitElement {
    constructor() {
        super(...arguments);
        this.isRangeEnabled = false;
    }
    render() {
        console.log('Render right pane');
        if (this.schema) {
            return html `
        ${this.schema.properties.map((item) => html ` ${this.renderFormFieldset(item)}`)}
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
    renderFormFieldset(fieldTypeProperty) {
        return html `
      <div class="form-group">
        ${fieldTypeProperty.dataType === 'boolean' ? html `
          <div class="form-check">
            ${this.renderFormField(fieldTypeProperty)}
            <label for="${fieldTypeProperty.name}" class="form-check-label fw-bold">Property '${fieldTypeProperty.name}'</label>
          </div>
        ` : html `
          <label for="${fieldTypeProperty.name}" class="form-label">Property '${fieldTypeProperty.name}'</label>
          ${this.renderFormField(fieldTypeProperty)}
        `}
      </div>`;
    }
    renderFormField(fieldTypeProperty) {
        // https://lit.dev/docs/templates/directives/#live
        switch (fieldTypeProperty.dataType) {
            case 'text':
                return html `<input @blur="${this.dispatchBlurEvent}" type="text" id="${fieldTypeProperty.name}" .value="${live(this.values[fieldTypeProperty.name] || fieldTypeProperty.default || '')}" class="form-control" />`;
            case 'number':
                return html `<input @blur="${this.dispatchBlurEvent}" type="number" id="${fieldTypeProperty.name}" .value="${live(this.values[fieldTypeProperty.name] || fieldTypeProperty.default)}" class="form-control" />`;
            case 'select':
                return html `<select @blur="${this.dispatchBlurEvent}" class="form-control" id="${fieldTypeProperty.name}" >
          <option value="">Choose...</option>
          ${fieldTypeProperty.items.map((option) => html `
            <option .value="${live(option.value)}">${option.label}</option>`)}
        </select>`;
            case 'boolean':
                return html `<input @blur="${this.dispatchBlurEvent}" type="checkbox" id="${fieldTypeProperty.name}" ?checked=${live(this.values[fieldTypeProperty.name] || fieldTypeProperty.default)} class="form-check-input" />`;
            case 'textarea':
                return html `<textarea @blur="${this.dispatchBlurEvent}" id="${fieldTypeProperty.name}" class="form-control">${live(fieldTypeProperty.default)}</textarea>`;
            case 'array':
                switch (fieldTypeProperty.name) {
                    case 'valuePicker':
                        return html `<content-block-editor-value-picker
                  .fieldTypeProperty="${fieldTypeProperty}"
                  .values="${this.values}"
                  .position="${this.position}"
                  .level="${this.level}"
                  .parent="${this.parent}"
                  @updateCbFieldData="${this.dispatchUpdateEvent}">
                </content-block-editor-value-picker>`;
                    case 'range':
                        this.updateRangeEnabledState();
                        return html `
                  <div class="range-container">
                    <div class="form-check">
                      <input @change="${this.handleRangeEnabledChange}" 
                        type="checkbox" 
                        id="range_enabled" 
                        ?checked="${live(this.isRangeEnabled)}" 
                        class="form-check-input" />
                      <label class="form-check-label" for="range_enabled">
                        Enable Range
                      </label>
                    </div>
                    ${this.isRangeEnabled ? html `
                      <div class="range-inputs mt-2">
                        <div class="row">
                          <div class="col-6">
                            <label for="range_lower">Lower:</label>
                            <input @blur="${this.handleRangeInputChange}" 
                              type="number" 
                              id="range_lower" 
                              .value="${live(this.values['range']?.lower || 0)}" 
                              class="form-control" />
                          </div>
                          <div class="col-6">
                            <label for="range_upper">Upper:</label>
                            <input @blur="${this.handleRangeInputChange}" 
                              type="number" 
                              id="range_upper" 
                              .value="${live(this.values['range']?.upper || 100)}" 
                              class="form-control" />
                          </div>
                        </div>
                      </div>
                    ` : ''}
                  </div>`;
                    default:
                        return html `Array field type for property ${fieldTypeProperty.name} is not yet implemented.`;
                }
            default:
                return html `Unknown field type property ${fieldTypeProperty.name}.`;
        }
    }
    dispatchUpdateEvent() {
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
    dispatchBlurEvent(event) {
        event.preventDefault();
        const target = event.target;
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
    updateRangeEnabledState() {
        const range = this.values['range'];
        console.log(range);
        this.isRangeEnabled = range?.enabled || false;
        console.log(this.isRangeEnabled);
    }
    handleRangeEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values['range']) {
            this.values['range'] = {};
        }
        this.isRangeEnabled = target.checked;
        this.values['range'].enabled = target.checked;
        if (target.checked) {
            if (this.values['range'].lower === undefined) {
                this.values['range'].lower = 0;
            }
            if (this.values['range'].upper === undefined) {
                this.values['range'].upper = 100;
            }
        }
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
    handleRangeInputChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values['range']) {
            this.values['range'] = {};
        }
        if (target.id === 'range_lower') {
            this.values['range'].lower = parseInt(target.value);
        }
        else if (target.id === 'range_upper') {
            this.values['range'].upper = parseInt(target.value);
        }
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
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "schema", void 0);
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorRightPane.prototype, "isRangeEnabled", void 0);
ContentBlockEditorRightPane = __decorate([
    customElement('content-block-editor-right-pane')
], ContentBlockEditorRightPane);
export { ContentBlockEditorRightPane };
