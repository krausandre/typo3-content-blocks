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
 * <content-block-editor-allowed-custom-properties></content-block-editor-allowed-custom-properties>
 */
let ContentBlockEditorAllowedCustomProperties = class ContentBlockEditorAllowedCustomProperties extends LitElement {
    constructor() {
        super(...arguments);
        this.isAllowedCustomPropertiesEnabled = false;
    }
    render() {
        this.updateAllowedCustomPropertiesEnabledState();
        const currentValue = this.values.allowedCustomProperties || { itemProcFunc: '' };
        return html `
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleAllowedCustomPropertiesEnabledChange}" 
              type="checkbox" 
              id="allowedCustomProperties_enabled" 
              ?checked="${live(this.isAllowedCustomPropertiesEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="allowedCustomProperties_enabled">
              Allowed Custom Properties (itemsProcFunc)
            </label>
          </div>
        </div>
        ${this.isAllowedCustomPropertiesEnabled ? html `
          <div class="component-body">
            <div class="form-group mb-3">
              <label class="form-label" for="itemProcFunc">Items Proc Function</label>
              <input @blur="${this.handleItemProcFuncChange}" 
                type="text" 
                id="itemProcFunc"
                .value="${live(currentValue.itemProcFunc || '')}" 
                class="form-control"
                placeholder="e.g., EXT:my_ext/Classes/ItemsProcFunc.php:MyClass-&gt;getItems" />
              <div class="form-text">
                Specify the itemsProcFunc for dynamic item generation.
              </div>
            </div>
          </div>
        ` : ''}
      </div>`;
    }
    updateAllowedCustomPropertiesEnabledState() {
        const allowedCustomProperties = this.values.allowedCustomProperties;
        this.isAllowedCustomPropertiesEnabled = !!(allowedCustomProperties?.enabled || allowedCustomProperties?.itemProcFunc);
    }
    handleAllowedCustomPropertiesEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        this.isAllowedCustomPropertiesEnabled = target.checked;
        if (target.checked) {
            // Initialize with empty itemProcFunc
            this.values.allowedCustomProperties = { itemProcFunc: '', enabled: true };
        }
        else {
            // Clear the object
            this.values.allowedCustomProperties = { itemProcFunc: '', enabled: false };
        }
        this.dispatchUpdateEvent();
    }
    handleItemProcFuncChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values.allowedCustomProperties) {
            this.values.allowedCustomProperties = { itemProcFunc: '', enabled: true };
        }
        const currentProperties = this.values.allowedCustomProperties;
        currentProperties.itemProcFunc = target.value;
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
], ContentBlockEditorAllowedCustomProperties.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedCustomProperties.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedCustomProperties.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedCustomProperties.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedCustomProperties.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedCustomProperties.prototype, "isAllowedCustomPropertiesEnabled", void 0);
ContentBlockEditorAllowedCustomProperties = __decorate([
    customElement('content-block-editor-allowed-custom-properties')
], ContentBlockEditorAllowedCustomProperties);
export { ContentBlockEditorAllowedCustomProperties };
