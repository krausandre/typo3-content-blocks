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
 * <content-block-editor-items></content-block-editor-items>
 */
let ContentBlockEditorItems = class ContentBlockEditorItems extends LitElement {
    constructor() {
        super(...arguments);
        this.isItemsEnabled = false;
    }
    render() {
        this.updateItemsEnabledState();
        const itemsObject = this.values.items || {};
        const currentItems = itemsObject.items || [];
        return html `
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleItemsEnabledChange}" 
              type="checkbox" 
              id="items_enabled" 
              ?checked="${live(this.isItemsEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="items_enabled">
              Items Configuration
            </label>
          </div>
        </div>
        ${this.isItemsEnabled ? html `
          <div class="component-body">
            <div class="form-group mb-3">
              <div class="items-list">
                ${currentItems.map((item, index) => html `
                  <div class="item-row border rounded p-3 mb-2 position-relative">
                    <div class="row g-2">
                      <div class="col-md-5">
                        <label class="form-label">Label</label>
                        <input @blur="${this.handleItemValueChange}" 
                          type="text" 
                          data-index="${index}"
                          data-field="label"
                          .value="${live(item.label || '')}" 
                          class="form-control form-control-sm"
                          placeholder="Display label" />
                      </div>
                      <div class="col-md-5">
                        <label class="form-label">Value</label>
                        <input @blur="${this.handleItemValueChange}" 
                          type="text" 
                          data-index="${index}"
                          data-field="value"
                          .value="${live(item.value || '')}" 
                          class="form-control form-control-sm"
                          placeholder="Stored value" />
                      </div>
                      <div class="col-md-2 d-flex align-items-center justify-content-center" style="padding-top: 2rem;">
                        <button @click="${this.handleRemoveItem}" 
                          type="button" 
                          data-index="${index}"
                          class="btn btn-sm btn-outline-danger"
                          title="Remove item">
                          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
                        </button>
                      </div>
                    </div>
                    <div class="row g-2 mt-1">
                      <div class="col-md-5">
                        <label class="form-label">Checked Label</label>
                        <input @blur="${this.handleItemValueChange}" 
                          type="text" 
                          data-index="${index}"
                          data-field="labelChecked"
                          .value="${live(item.labelChecked || '')}" 
                          class="form-control form-control-sm"
                          placeholder="When checked" />
                      </div>
                      <div class="col-md-5">
                        <label class="form-label">Unchecked Label</label>
                        <input @blur="${this.handleItemValueChange}" 
                          type="text" 
                          data-index="${index}"
                          data-field="labelUnchecked"
                          .value="${live(item.labelUnchecked || '')}" 
                          class="form-control form-control-sm"
                          placeholder="When unchecked" />
                      </div>
                    </div>
                    <div class="row g-2 mt-2">
                      <div class="col-12">
                        <div class="form-check">
                          <input @change="${this.handleItemBooleanChange}" 
                            type="checkbox" 
                            data-index="${index}"
                            data-field="invertStateDisplay"
                            ?checked="${live(item.invertStateDisplay || false)}" 
                            class="form-check-input"
                            id="invertStateDisplay_${index}" />
                          <label class="form-check-label" for="invertStateDisplay_${index}">
                            Invert State Display
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
              <button @click="${this.handleAddItem}" 
                type="button" 
                class="btn btn-sm btn-outline-primary">
                <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
                Add Item
              </button>
            </div>
          </div>
        ` : ''}
      </div>`;
    }
    updateItemsEnabledState() {
        const itemsObject = this.values.items;
        if (itemsObject && Object.prototype.hasOwnProperty.call(itemsObject, 'enabled')) {
            // If enabled property is explicitly set, use that value
            this.isItemsEnabled = !!itemsObject.enabled;
        }
        else if (itemsObject?.items && itemsObject.items.length > 0) {
            // If no enabled property but has items, consider it enabled on initial render
            this.isItemsEnabled = true;
        }
        else {
            // Default to disabled if no items object or no items
            this.isItemsEnabled = false;
        }
    }
    handleItemsEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values.items) {
            this.values.items = {};
        }
        this.isItemsEnabled = target.checked;
        const items = this.values.items;
        items.enabled = target.checked;
        if (target.checked) {
            if (!items.items) {
                items.items = [{ label: '', value: '' }];
            }
        }
        else {
            items.items = [];
        }
        this.dispatchUpdateEvent();
    }
    handleItemValueChange(event) {
        event.preventDefault();
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        const field = target.dataset.field;
        if (!this.values.items) {
            this.values.items = { items: [], enabled: true };
        }
        const itemsCfg = this.values.items;
        if (!itemsCfg.items || !Array.isArray(itemsCfg.items)) {
            itemsCfg.items = [];
        }
        const currentItems = itemsCfg.items;
        if (currentItems[index]) {
            currentItems[index][field] = target.value;
        }
        this.dispatchUpdateEvent();
    }
    handleItemBooleanChange(event) {
        event.preventDefault();
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        const field = target.dataset.field;
        if (!this.values.items) {
            this.values.items = { items: [], enabled: true };
        }
        const itemsCfg = this.values.items;
        if (!itemsCfg.items || !Array.isArray(itemsCfg.items)) {
            itemsCfg.items = [];
        }
        const currentItems = itemsCfg.items;
        if (currentItems[index]) {
            currentItems[index][field] = target.checked;
        }
        this.dispatchUpdateEvent();
    }
    handleAddItem(event) {
        event.preventDefault();
        if (!this.values.items) {
            this.values.items = { items: [], enabled: true };
        }
        const itemsCfg = this.values.items;
        if (!itemsCfg.items || !Array.isArray(itemsCfg.items)) {
            itemsCfg.items = [];
        }
        itemsCfg.items.push({ label: '', value: '' });
        this.requestUpdate();
        this.dispatchUpdateEvent();
    }
    handleRemoveItem(event) {
        event.preventDefault();
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        const itemsCfg = this.values.items;
        if (!itemsCfg || !itemsCfg.items || !Array.isArray(itemsCfg.items)) {
            return;
        }
        itemsCfg.items.splice(index, 1);
        // If no items left, disable the feature
        if (itemsCfg.items.length === 0) {
            this.isItemsEnabled = false;
            itemsCfg.enabled = false;
        }
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
], ContentBlockEditorItems.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorItems.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorItems.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorItems.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorItems.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorItems.prototype, "isItemsEnabled", void 0);
ContentBlockEditorItems = __decorate([
    customElement('content-block-editor-items')
], ContentBlockEditorItems);
export { ContentBlockEditorItems };
