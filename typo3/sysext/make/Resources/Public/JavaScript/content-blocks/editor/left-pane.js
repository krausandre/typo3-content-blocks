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
var __decorate=function(t,e,o,n){var i,a=arguments.length,s=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(s=(a<3?i(s):a>3?i(e,o,s):i(e,o))||s);return a>3&&s&&Object.defineProperty(e,o,s),s};import{html,LitElement,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane-content-block-settings.js";import"@typo3/make/content-blocks/editor/left-pane-components.js";import"@typo3/make/content-blocks/editor/left-pane-basics.js";let ContentBlockEditorLeftPane=class extends LitElement{constructor(){super(...arguments),this.activeTab="settings"}render(){const t="settings"===this.activeTab,e="components"===this.activeTab,o="basics"===this.activeTab;return html`
      <div role="tabpanel">
        <ul class="nav nav-tabs t3js-tabs" role="tablist" id="tabs-content-elements" data-store-last-tab="1">
          <li role="presentation" class="t3js-tabmenu-item">
            <a href="#"
               @click="${()=>{this.setActiveTab("settings")}}"
               title=""
               aria-selected="${t?"true":"false"}"
               class="${t?"active":nothing}"
            >
              Settings
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a
              href="#"
              @click="${()=>{this.setActiveTab("components")}}"
              title=""
              aria-selected="${e?"true":"false"}"
              class="${e?"active":nothing}"
            >
              Components
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a href="#"
               @click="${()=>{this.setActiveTab("basics")}}"
               title=""
               aria-selected="${o?"true":"false"}"
               class="${o?"active":nothing}"
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
    `}createRenderRoot(){return this}renderTab(){switch(this.activeTab){case"settings":return html`<editor-left-pane-content-block-settings .contentBlockYaml="${this.contentBlockYaml}" .groups="${this.groups}" .extensions="${this.extensions}"></editor-left-pane-content-block-settings>`;case"components":return html`<editor-left-pane-components .fieldTypes="${this.fieldTypes}"></editor-left-pane-components>`;case"basics":return html`<editor-left-pane-basics></editor-left-pane-basics>`;default:return html`Unknown tab: ${this.activeTab}`}}setActiveTab(t){this.activeTab=t}};__decorate([property()],ContentBlockEditorLeftPane.prototype,"activeTab",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"groups",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"contentBlockYaml",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"fieldTypes",void 0),ContentBlockEditorLeftPane=__decorate([customElement("content-block-editor-left-pane")],ContentBlockEditorLeftPane);export{ContentBlockEditorLeftPane};