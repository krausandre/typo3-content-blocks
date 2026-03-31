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
import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@typo3/backend/element/icon-element.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-content-block-settings></editor-left-pane-content-block-settings>
 */
let EditorLeftPaneContentBlockSettings = class EditorLeftPaneContentBlockSettings extends LitElement {
    static { this.styles = css ``; }
    render() {
        const isBasicMode = this.contenttype === 'basic';
        const isEditMode = this.mode === 'edit';
        return html `
      <div class="form-group">
        <label for="extension" class="form-label">Extension</label>
        <select class="form-control" id="extension" ?disabled="${isEditMode}" @change="${this.handleInputChange}">
          <option value="0">Choose...</option>
          ${this.extensions.map((extension) => html `
            <option value="${extension.package}" ?selected="${extension.package === this.hostExtension}">${extension.extension}</option>
          `)}
        </select>
        ${isEditMode ? html `
          <div class="form-text text-muted mt-1">
            <typo3-backend-icon identifier="actions-document-info" size="small"></typo3-backend-icon>
            Extension cannot be changed in edit mode. Use "Duplicate" to copy to another extension.
          </div>
        ` : ''}
      </div>
      <div class="form-group">
        <label for="vendor" class="form-label">Vendor</label>
        <input type="text" id="vendor" class="form-control" value=${(this.contentBlockYaml.vendor || '')} @input="${this.handleInputChange}" />
      </div>
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input type="text" id="name" class="form-control" value=${(this.contentBlockYaml.name || '')} @input="${this.handleInputChange}" />
      </div>
      ${!isBasicMode ? html `
        <div class="form-group">
          <label for="title" class="form-label">Title</label>
          <input type="text" id="title" class="form-control" value="${this.contentBlockYaml.title || ''}" @input="${this.handleInputChange}" />
        </div>
        <div class="form-group">
          <div class="form-check">
            <input type="checkbox" id="prefix" class="form-check-input" ?checked=${this.contentBlockYaml.prefixFields} @change="${this.handleInputChange}" />
            <label for="prefix" class="form-check-label">Prefix fields</label>
          </div>
        </div>
        <div class="form-group">
          <label for="prefix-type" class="form-label">Prefix type</label>
          <select class="form-control" id="prefix-type" @change="${this.handleInputChange}">
            <option value="">Choose...</option>
            <option value="full" ?selected="${this.contentBlockYaml.prefixType === 'full' || !this.contentBlockYaml.prefixType}" >Full</option>
            <option value="vendor" ?selected="${this.contentBlockYaml.prefixType === 'vendor'}" >Vendor</option>
          </select>
        </div>
        <div class="form-group">
          <label for="vendor-prefix" class="form-label">Vendor prefix</label>
          <input type="text" id="vendor-prefix" class="form-control" value="${this.contentBlockYaml.vendorPrefix || ''}" @input="${this.handleInputChange}" />
        </div>
        <div class="form-group">
          <label for="priority" class="form-label">Priority</label>
          <input type="number" id="priority" class="form-control" value="${this.contentBlockYaml.priority || ''}" @input="${this.handleInputChange}" />
        </div>
        <div class="form-group">
          <label for="group" class="form-label">Group</label>
          <select class="form-control" id="group" @change="${this.handleInputChange}">
            <option value="">Choose...</option>
            ${this.groups.map((group) => html `
              <option value="${group.key}" ?selected="${this.getGroupSelectionState(group.key)}">${group.label}</option>
            `)}
          </select>
        </div>
        <div class="form-group">
          <label for="typeName" class="form-label">typeName</label>
          <input type="text" id="typeName" class="form-control" value="${this.contentBlockYaml.typeName || ''}" @input="${this.handleInputChange}" />
        </div>
      ` : ''}
    `;
    }
    getGroupSelectionState(groupKey) {
        if (this.contentBlockYaml.group && this.contentBlockYaml.group === groupKey) {
            return true;
        }
        if (!this.contentBlockYaml.group || !this.groups.some(group => group.key === this.contentBlockYaml.group)) {
            return groupKey === 'default';
        }
        return false;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
    handleInputChange() {
        const isBasicMode = this.contenttype === 'basic';
        // Read all current form values
        const settings = {};
        // Extension (for parent component, not part of YAML)
        const extensionSelect = this.renderRoot.querySelector('#extension');
        if (extensionSelect) {
            settings.hostExtension = extensionSelect.value;
        }
        // Vendor and Name
        const vendorInput = this.renderRoot.querySelector('#vendor');
        const nameInput = this.renderRoot.querySelector('#name');
        if (vendorInput) {
            settings.vendor = vendorInput.value;
        }
        if (nameInput) {
            settings.name = nameInput.value;
        }
        // Content Block specific fields
        if (!isBasicMode) {
            const titleInput = this.renderRoot.querySelector('#title');
            const prefixCheckbox = this.renderRoot.querySelector('#prefix');
            const prefixTypeSelect = this.renderRoot.querySelector('#prefix-type');
            const vendorPrefixInput = this.renderRoot.querySelector('#vendor-prefix');
            const priorityInput = this.renderRoot.querySelector('#priority');
            const groupSelect = this.renderRoot.querySelector('#group');
            const typeName = this.renderRoot.querySelector('#typeName');
            if (titleInput) {
                settings.title = titleInput.value;
            }
            if (prefixCheckbox) {
                settings.prefixFields = prefixCheckbox.checked;
            }
            if (prefixTypeSelect) {
                settings.prefixType = prefixTypeSelect.value;
            }
            if (vendorPrefixInput) {
                settings.vendorPrefix = vendorPrefixInput.value;
            }
            if (priorityInput) {
                settings.priority = priorityInput.value ? parseInt(priorityInput.value, 10) : undefined;
            }
            if (groupSelect) {
                settings.group = groupSelect.value;
            }
            if (typeName) {
                settings.typeName = typeName.value;
            }
        }
        // Dispatch custom event to parent
        this.dispatchEvent(new CustomEvent('settings-changed', {
            detail: { settings },
            bubbles: true,
            composed: true
        }));
    }
};
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "groups", void 0);
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "extensions", void 0);
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "contentBlockYaml", void 0);
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "hostExtension", void 0);
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "mode", void 0);
__decorate([
    property()
], EditorLeftPaneContentBlockSettings.prototype, "contenttype", void 0);
EditorLeftPaneContentBlockSettings = __decorate([
    customElement('editor-left-pane-content-block-settings')
], EditorLeftPaneContentBlockSettings);
export { EditorLeftPaneContentBlockSettings };
