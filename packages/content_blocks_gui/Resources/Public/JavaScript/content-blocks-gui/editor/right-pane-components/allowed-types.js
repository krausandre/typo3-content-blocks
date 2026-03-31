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
 * <content-block-editor-allowed-types></content-block-editor-allowed-types>
 */
let ContentBlockEditorAllowedTypes = class ContentBlockEditorAllowedTypes extends LitElement {
    constructor() {
        super(...arguments);
        this.isAllowedTypesEnabled = false;
        this.availableLinkTypes = [
            { value: 'page', label: 'Page' },
            { value: 'url', label: 'URL' },
            { value: 'file', label: 'File' },
            { value: 'folder', label: 'Folder' },
            { value: 'email', label: 'Email' },
            { value: 'telephone', label: 'Telephone' },
            { value: 'record', label: 'Record' }
        ];
    }
    render() {
        this.updateAllowedTypesEnabledState();
        const currentValue = this.values.allowedTypes || [];
        return html `
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleAllowedTypesEnabledChange}" 
              type="checkbox" 
              id="allowedTypes_enabled" 
              ?checked="${live(this.isAllowedTypesEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="allowedTypes_enabled">
              Link Type Restrictions
            </label>
          </div>
        </div>
        ${this.isAllowedTypesEnabled ? html `
          <div class="component-body">
            <div class="form-group">
              <label class="form-label">Allowed Link Types</label>
              <div class="link-types-grid">
                ${this.availableLinkTypes.map(type => html `
                  <div class="form-check">
                    <input @change="${this.handleLinkTypeChange}" 
                      type="checkbox" 
                      id="linktype_${type.value}" 
                      data-value="${type.value}"
                      ?checked="${live(currentValue.includes(type.value))}" 
                      class="form-check-input" />
                    <label class="form-check-label" for="linktype_${type.value}">
                      ${type.label}
                    </label>
                  </div>
                `)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>`;
    }
    updateAllowedTypesEnabledState() {
        const allowedTypes = this.values.allowedTypes;
        this.isAllowedTypesEnabled = allowedTypes && Array.isArray(allowedTypes) && allowedTypes.length > 0 && !allowedTypes.includes('*');
    }
    handleAllowedTypesEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        this.isAllowedTypesEnabled = target.checked;
        if (target.checked) {
            // Initialize with all types selected
            this.values.allowedTypes = [...this.availableLinkTypes.map(type => type.value)];
        }
        else {
            // Set to default (all types allowed)
            this.values.allowedTypes = ['*'];
        }
        this.dispatchUpdateEvent();
    }
    handleLinkTypeChange(event) {
        event.preventDefault();
        const target = event.target;
        const typeValue = target.dataset.value;
        if (!this.values.allowedTypes || !Array.isArray(this.values.allowedTypes)) {
            this.values.allowedTypes = [];
        }
        const currentTypes = this.values.allowedTypes;
        if (target.checked) {
            if (!currentTypes.includes(typeValue)) {
                currentTypes.push(typeValue);
            }
        }
        else {
            const index = currentTypes.indexOf(typeValue);
            if (index > -1) {
                currentTypes.splice(index, 1);
            }
        }
        // If no types selected, revert to default
        if (currentTypes.length === 0) {
            this.values.allowedTypes = ['*'];
            this.isAllowedTypesEnabled = false;
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
], ContentBlockEditorAllowedTypes.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedTypes.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedTypes.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedTypes.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedTypes.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorAllowedTypes.prototype, "isAllowedTypesEnabled", void 0);
ContentBlockEditorAllowedTypes = __decorate([
    customElement('content-block-editor-allowed-types')
], ContentBlockEditorAllowedTypes);
export { ContentBlockEditorAllowedTypes };
