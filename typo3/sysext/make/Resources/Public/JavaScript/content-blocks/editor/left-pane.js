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
var __decorate=function(t,e,o,n){var i,a=arguments.length,c=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,n);else for(var r=t.length-1;r>=0;r--)(i=t[r])&&(c=(a<3?i(c):a>3?i(e,o,c):i(e,o))||c);return a>3&&c&&Object.defineProperty(e,o,c),c};import{html,LitElement,css,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane-content-block-settings.js";import"@typo3/make/content-blocks/editor/left-pane-components.js";import"@typo3/make/content-blocks/editor/left-pane-basics.js";let ContentBlockEditorLeftPane=class extends LitElement{constructor(){super(...arguments),this.activeTab="settings"}render(){const t="settings"===this.activeTab,e="components"===this.activeTab,o="basics"===this.activeTab;return html`
      <p>I am the Left pane</p>
      <div class="left-pane-tabs-container">
        <div class="tabs-headers">
          <ul>
            <li class="${t?html`active`:nothing}" @click="${()=>{this.setActiveTab("settings")}}">
              Content Block settings
            </li>
            <li class="${e?html`active`:nothing}" @click="${()=>{this.setActiveTab("components")}}">
              Components
            </li>
            <li class="${o?html`active`:nothing}" @click=${()=>{this.setActiveTab("basics")}}>
              Basics
            </li>
          </ul>
        </div>
        <div class="active-tab">
          ${this.renderTab()}
        </div>
      </div>
    `}createRenderRoot(){return this}renderTab(){switch(this.activeTab){case"settings":return html`<editor-left-pane-content-block-settings .contentBlockConfig="${this.contentBlockYaml}"></editor-left-pane-content-block-settings>`;case"components":return html`<editor-left-pane-components></editor-left-pane-components>`;case"basics":return html`<editor-left-pane-basics></editor-left-pane-basics>`;default:return html`Unknown tab: ${this.activeTab}`}}setActiveTab(t){this.activeTab=t}};ContentBlockEditorLeftPane.styles=css`
    .left-pane-tabs-container {
      .tab-headers ul {
        margin: 0;
        padding: 0;
        display: flex;
        border-bottom: 2px solid var(--typo3-component-border-color);
      }

      .tab-headers ul li {
        list-style: none;
        padding: 1rem 1.25rem;
        position: relative;
        cursor: pointer;
      }

      .tab-headers ul li.active {
        color: var(--typo3-component-active-color);
        background: var(--typo3-component-active-bg);
        font-weight: bold;
      }

      .tab-headers ul li.active:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        height: 2px;
        width: 100%;
        background: var(--typo3-component-active-border-color);
      }

      .active-tab, #tab-headers {
        width: 100%;
      }

      .active-tab {
        padding: 0.75rem;
      }
    }

  `,__decorate([property()],ContentBlockEditorLeftPane.prototype,"activeTab",void 0),__decorate([property()],ContentBlockEditorLeftPane.prototype,"contentBlockYaml",void 0),ContentBlockEditorLeftPane=__decorate([customElement("content-block-editor-left-pane")],ContentBlockEditorLeftPane);export{ContentBlockEditorLeftPane};