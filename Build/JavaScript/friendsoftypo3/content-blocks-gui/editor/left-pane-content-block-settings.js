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
import { html, LitElement, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import { ExtensionDefinition, GroupDefinition, ContentBlocksYaml } from '@friendsoftypo3/content-blocks-gui/interface/definitions';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-content-block-settings></editor-left-pane-content-block-settings>
 */
let EditorLeftPaneContentBlockSettings = class EditorLeftPaneContentBlockSettings extends LitElement {
    static { this.styles = css ``; }
    render() {
        return html `
      <div class="form-group">
        <label for="extension" class="form-label">Extension</label>
        <select class="form-control" id="extension">
          <option value="0">Choose...</option>
          ${this.extensions.map((extension) => html `
            <option value="${extension.package}" ?selected="${extension.package === this.hostExtension}">${extension.extension}</option>
          `)}
        </select>
      </div>
      <div class="form-group">
        <label for="vendor" class="form-label">Vendor</label>
        <input type="text" id="vendor" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input type="text" id="name" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="title" class="form-label">Title</label>
        <input type="text" id="title" class="form-control" value="${this.contentBlockYaml.title || ''}" />
      </div>
      <div class="form-group">
        <input type="checkbox" id="prefix" class="form-check-input" ?checked=${this.contentBlockYaml.prefixFields} />
        <label for="prefix" class="form-check-label">Prefix fields?</label>
      </div>
      <div class="form-group">
        <label for="prefix-type" class="form-label">Prefix type</label>
        <select class="form-control" id="prefix-type">
          <option value="">Choose...</option>
          <option value="full" ?selected="${this.contentBlockYaml.prefixType === 'full'}" >Full</option>
          <option value="vendor" ?selected="${this.contentBlockYaml.prefixType === 'vendor'}" >Vendor</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor-prefix" class="form-label">Vendor prefix</label>
        <input type="text" id="vendor-prefix" class="form-control" value="${this.contentBlockYaml.vendorPrefix || ''}" />
      </div>
      <div class="form-group">
        <label for="priority" class="form-label">Priority</label>
        <input type="number" id="priority" class="form-control" value="${this.contentBlockYaml.priority || ''}" />
      </div>
      <div class="form-group">
        <label for="group" class="form-label">Group</label>
        <select class="form-control" id="group">
          <option value="">Choose...</option>
          ${this.groups.map((group) => html `
            <option value="${group.key}" ?selected="${group.key === this.contentBlockYaml.group}">${group.label}</option>
          `)}
        </select>
      </div>
      <div class="form-group">
        <a href="#" class="btn btn-success">
          <span class="t3js-icon icon icon-size-small icon-state-default icon-apps-filetree-folder-default" data-identifier="apps-filetree-folder-default" aria-hidden="true">
            <typo3-backend-icon identifier="actions-save" size="small"></typo3-backend-icon>
          </span>  Save
        </a>
      </div>
    `;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
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
EditorLeftPaneContentBlockSettings = __decorate([
    customElement('editor-left-pane-content-block-settings')
], EditorLeftPaneContentBlockSettings);
export { EditorLeftPaneContentBlockSettings };
