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
import { live } from 'lit/directives/live.js';
import { FieldTypeProperty } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-value-picker></content-block-editor-value-picker>
 */
let ContentBlockEditorValuePicker = class ContentBlockEditorValuePicker extends LitElement {
    render() {
        const currentValue = this.values[this.fieldTypeProperty.name] || { mode: 'blank', items: [] };
        return html `
      <div class="value-picker-config">
        <div class="form-group">
          <label for="${this.fieldTypeProperty.name}_mode" class="form-label">Mode</label>
          <select @change="${this.updateValuePickerMode}" class="form-control" id="${this.fieldTypeProperty.name}_mode" data-field="${this.fieldTypeProperty.name}">
            <option value="blank" ?selected=${currentValue.mode === 'blank'}>Blank (replace)</option>
            <option value="append" ?selected=${currentValue.mode === 'append'}>Append</option>
            <option value="prepend" ?selected=${currentValue.mode === 'prepend'}>Prepend</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Items</label>
          <div class="value-picker-items">
            ${(currentValue.items || []).map((item, index) => html `
              <div class="row mb-2">
                <div class="col-5">
                  <input 
                    @blur="${this.updateValuePickerItem}" 
                    type="text" 
                    placeholder="Label" 
                    .value="${live(item[0] || '')}" 
                    class="form-control" 
                    data-field="${this.fieldTypeProperty.name}" 
                    data-index="${index}" 
                    data-part="label" />
                </div>
                <div class="col-5">
                  <input 
                    @blur="${this.updateValuePickerItem}" 
                    type="text" 
                    placeholder="Value" 
                    .value="${live(item[1] || '')}" 
                    class="form-control" 
                    data-field="${this.fieldTypeProperty.name}" 
                    data-index="${index}" 
                    data-part="value" />
                </div>
                <div class="col-2">
                  <button 
                    @click="${this.removeValuePickerItem}" 
                    class="btn btn-danger btn-sm" 
                    data-field="${this.fieldTypeProperty.name}" 
                    data-index="${index}">
                    ×
                  </button>
                </div>
              </div>
            `)}
            <button 
              @click="${this.addValuePickerItem}" 
              class="btn btn-secondary btn-sm" 
              data-field="${this.fieldTypeProperty.name}">
              Add Item
            </button>
          </div>
        </div>
      </div>
    `;
    }
    updateValuePickerMode(event) {
        const target = event.target;
        const fieldName = target.dataset.field;
        const currentValue = this.values[fieldName] || { mode: 'blank', items: [] };
        this.values[fieldName] = {
            ...currentValue,
            mode: target.value
        };
        this.dispatchUpdateEvent();
    }
    updateValuePickerItem(event) {
        const target = event.target;
        const fieldName = target.dataset.field;
        const index = parseInt(target.dataset.index);
        const part = target.dataset.part;
        const currentValue = this.values[fieldName] || { mode: 'blank', items: [] };
        if (!currentValue.items[index]) {
            currentValue.items[index] = ['', ''];
        }
        currentValue.items[index][part === 'label' ? 0 : 1] = target.value;
        this.values[fieldName] = currentValue;
        this.dispatchUpdateEvent();
    }
    addValuePickerItem(event) {
        event.preventDefault();
        const target = event.target;
        const fieldName = target.dataset.field;
        const currentValue = this.values[fieldName] || { mode: 'blank', items: [] };
        currentValue.items.push(['', '']);
        this.values[fieldName] = currentValue;
        this.requestUpdate();
        this.dispatchUpdateEvent();
    }
    removeValuePickerItem(event) {
        event.preventDefault();
        const target = event.target;
        const fieldName = target.dataset.field;
        const index = parseInt(target.dataset.index);
        const currentValue = this.values[fieldName] || { mode: 'blank', items: [] };
        currentValue.items.splice(index, 1);
        this.values[fieldName] = currentValue;
        this.requestUpdate();
        this.dispatchUpdateEvent();
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
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "parent", void 0);
ContentBlockEditorValuePicker = __decorate([
    customElement('content-block-editor-value-picker')
], ContentBlockEditorValuePicker);
export { ContentBlockEditorValuePicker };
