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
var __decorate=function(t,e,n,o){var a,s=arguments.length,i=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,n):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,n,o);else for(var c=t.length-1;c>=0;c--)(a=t[c])&&(i=(s<3?a(i):s>3?a(e,n,i):a(e,n))||i);return s>3&&i&&Object.defineProperty(e,n,i),i};import{html,LitElement,css,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane-content-block-settings.js";import"@typo3/make/content-blocks/editor/left-pane-components.js";import"@typo3/make/content-blocks/editor/left-pane-basics.js";let ContentBlockEditorLeftPane=class extends LitElement{constructor(){super(...arguments),this.activeTab="settings"}render(){const t="settings"===this.activeTab,e="components"===this.activeTab,n="basics"===this.activeTab;return html`
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
               aria-selected="${n?"true":"false"}"
               class="${n?"active":nothing}"
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
    `}createRenderRoot(){return this}renderTab(){switch(this.activeTab){case"settings":return html`<editor-left-pane-content-block-settings .contentBlockYaml="${this.contentBlockYaml}" .groups="${this.groups}" .extensions="${this.extensions}"></editor-left-pane-content-block-settings>`;case"components":return html`<editor-left-pane-components></editor-left-pane-components>`;case"basics":return html`<editor-left-pane-basics></editor-left-pane-basics>`;default:return html`Unknown tab: ${this.activeTab}`}}setActiveTab(t){this.activeTab=t}};ContentBlockEditorLeftPane.styles=css`
    .left-pane-tabs-container {

    }
  `,__decorate([property()],ContentBlockEditorLeftPane.prototype,"activeTab",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"groups",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"contentBlockYaml",void 0),ContentBlockEditorLeftPane=__decorate([customElement("content-block-editor-left-pane")],ContentBlockEditorLeftPane);export{ContentBlockEditorLeftPane};