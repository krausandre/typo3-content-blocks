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
import { html, LitElement, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import '@friendsoftypo3/content-blocks-gui/editor/left-pane-content-block-settings';
import '@friendsoftypo3/content-blocks-gui/editor/left-pane-components';
import '@friendsoftypo3/content-blocks-gui/editor/left-pane-basics';
import { ContentBlocksYaml } from '@friendsoftypo3/content-blocks-gui/interface/content-block-definition';
import { GroupDefinition } from '@friendsoftypo3/content-blocks-gui/interface/group-definition';
import { ExtensionDefinition } from '@friendsoftypo3/content-blocks-gui/interface/extension-definition';
import { FieldTypeSetting } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-left-pain></content-block-editor-left-pain>
 */
let ContentBlockEditorLeftPane = class ContentBlockEditorLeftPane extends LitElement {
    constructor() {
        super(...arguments);
        this.activeTab = 'settings';
    }
    render() {
        const isShowSettings = this.activeTab === 'settings';
        const isShowComponents = this.activeTab === 'components';
        const isShowBasics = this.activeTab === 'basics';
        return html `
      <div role="tabpanel">
        <ul class="nav nav-tabs t3js-tabs" role="tablist" id="tabs-content-elements" data-store-last-tab="1">
          <li role="presentation" class="t3js-tabmenu-item">
            <a href="#"
               @click="${() => { this.setActiveTab('settings'); }}"
               title=""
               aria-selected="${isShowSettings ? 'true' : 'false'}"
               class="${isShowSettings ? 'active' : nothing}"
            >
              Settings
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a
              href="#"
              @click="${() => { this.setActiveTab('components'); }}"
              title=""
              aria-selected="${isShowComponents ? 'true' : 'false'}"
              class="${isShowComponents ? 'active' : nothing}"
            >
              Components
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a href="#"
               @click="${() => { this.setActiveTab('basics'); }}"
               title=""
               aria-selected="${isShowBasics ? 'true' : 'false'}"
               class="${isShowBasics ? 'active' : nothing}"
            >
              Basics
            </a>
          </li>
        </ul>
        <div class="tab-content">
          <div role="tabpanel" class="tab-pane active" id="content-elements-1">
            <div class="panel panel-tab">
              <div class="panel-body">
                ${this.renderTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
    renderTab() {
        switch (this.activeTab) {
            case 'settings':
                return html `<editor-left-pane-content-block-settings .contentBlockYaml="${this.contentBlockYaml}" .groups="${this.groups}" .extensions="${this.extensions}"></editor-left-pane-content-block-settings>`;
            case 'components':
                return html `<editor-left-pane-components .fieldTypes="${this.fieldTypes}"></editor-left-pane-components>`;
            case 'basics':
                return html `<editor-left-pane-basics></editor-left-pane-basics>`;
            default:
                return html `Unknown tab: ${this.activeTab}`;
        }
    }
    setActiveTab(tab) {
        this.activeTab = tab;
    }
};
__decorate([
    property()
], ContentBlockEditorLeftPane.prototype, "activeTab", void 0);
__decorate([
    property()
], ContentBlockEditorLeftPane.prototype, "groups", void 0);
__decorate([
    property()
], ContentBlockEditorLeftPane.prototype, "extensions", void 0);
__decorate([
    property()
], ContentBlockEditorLeftPane.prototype, "contentBlockYaml", void 0);
__decorate([
    property()
], ContentBlockEditorLeftPane.prototype, "fieldTypes", void 0);
ContentBlockEditorLeftPane = __decorate([
    customElement('content-block-editor-left-pane')
], ContentBlockEditorLeftPane);
export { ContentBlockEditorLeftPane };
