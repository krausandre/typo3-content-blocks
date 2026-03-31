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
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-value-picker></content-block-editor-value-picker>
 */
let ContentBlockEditorValuePicker = class ContentBlockEditorValuePicker extends LitElement {
    constructor() {
        super(...arguments);
        this.isValuePickerEnabled = false;
    }
    render() {
        this.updateValuePickerEnabledState();
        const currentValue = this.values[this.fieldTypeProperty.name] || { items: [] };
        return html `
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleValuePickerEnabledChange}" 
              type="checkbox" 
              id="valuePicker_enabled" 
              ?checked="${live(this.isValuePickerEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="valuePicker_enabled">
              Value Picker
            </label>
          </div>
        </div>
        ${this.isValuePickerEnabled ? html `
          <div class="component-body">
            <div class="form-group">
              <label class="form-label">Items</label>
              <div class="items-list">
                ${(currentValue.items || []).map((item, index) => html `
                  <div class="item-row">
                    <div class="row g-2 align-items-center">
                      <div class="col">
                        <input 
                          @blur="${this.updateValuePickerItem}" 
                          type="text" 
                          placeholder="Label" 
                          .value="${live(item[0] || '')}" 
                          class="form-control form-control-sm" 
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}" 
                          data-part="label" />
                      </div>
                      <div class="col">
                        <input 
                          @blur="${this.updateValuePickerItem}" 
                          type="text" 
                          placeholder="Value" 
                          .value="${live(item[1] || '')}" 
                          class="form-control form-control-sm" 
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}" 
                          data-part="value" />
                      </div>
                      <div class="col-auto">
                        <button 
                          @click="${this.removeValuePickerItem}" 
                          class="btn btn-outline-danger btn-sm" 
                          title="Remove item"
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}">
                          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                `)}
                <div class="add-item-row">
                  <button 
                    @click="${this.addValuePickerItem}" 
                    class="btn btn-outline-secondary btn-sm" 
                    data-field="${this.fieldTypeProperty.name}">
                    <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    }
    updateValuePickerItem(event) {
        const target = event.target;
        const fieldName = this.fieldTypeProperty.name;
        const index = parseInt(target.dataset.index, 10);
        const part = target.dataset.part;
        if (!this.values[fieldName]) {
            this.values[fieldName] = { items: [], enabled: true };
        }
        const currentValue = this.values[fieldName];
        if (!currentValue.items) {
            currentValue.items = [];
        }
        if (!currentValue.items[index]) {
            currentValue.items[index] = ['', ''];
        }
        currentValue.items[index][part === 'label' ? 0 : 1] = target.value;
        this.values[fieldName] = currentValue;
        this.dispatchUpdateEvent();
    }
    addValuePickerItem(event) {
        event.preventDefault();
        const fieldName = this.fieldTypeProperty.name;
        if (!this.values[fieldName]) {
            this.values[fieldName] = { items: [], enabled: true };
        }
        const currentValue = this.values[fieldName];
        if (!currentValue.items) {
            currentValue.items = [];
        }
        currentValue.items.push(['', '']);
        this.values[fieldName] = currentValue;
        this.requestUpdate();
        this.dispatchUpdateEvent();
    }
    removeValuePickerItem(event) {
        event.preventDefault();
        const target = event.target;
        const fieldName = this.fieldTypeProperty.name;
        const index = parseInt(target.dataset.index, 10);
        const vp = this.values[fieldName];
        if (!vp || !vp.items) {
            return;
        }
        const currentValue = vp;
        currentValue.items.splice(index, 1);
        this.values[fieldName] = currentValue;
        this.requestUpdate();
        this.dispatchUpdateEvent();
    }
    updateValuePickerEnabledState() {
        const valuePicker = this.values[this.fieldTypeProperty.name];
        if (valuePicker && Object.prototype.hasOwnProperty.call(valuePicker, 'enabled')) {
            this.isValuePickerEnabled = !!valuePicker.enabled;
        }
        else if (valuePicker?.items && Array.isArray(valuePicker.items) && valuePicker.items.length > 0) {
            this.isValuePickerEnabled = true;
        }
        else {
            this.isValuePickerEnabled = false;
        }
    }
    handleValuePickerEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        const fieldName = this.fieldTypeProperty.name;
        if (!this.values[fieldName]) {
            this.values[fieldName] = { items: [] };
        }
        this.isValuePickerEnabled = target.checked;
        const vp = this.values[fieldName];
        vp.enabled = target.checked;
        if (target.checked) {
            if (!vp.items) {
                vp.items = [];
            }
        }
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
__decorate([
    property()
], ContentBlockEditorValuePicker.prototype, "isValuePickerEnabled", void 0);
ContentBlockEditorValuePicker = __decorate([
    customElement('content-block-editor-value-picker')
], ContentBlockEditorValuePicker);
export { ContentBlockEditorValuePicker };
