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
var __decorate=function(t,e,a,o){var i,n=arguments.length,s=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,a):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,a,o);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(s=(n<3?i(s):n>3?i(e,a,s):i(e,a))||s);return n>3&&s&&Object.defineProperty(e,a,s),s};import{html,LitElement,css,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let LeftPane=class extends LitElement{constructor(){super(...arguments),this.activeTab="settings"}render(){const t="settings"===this.activeTab,e="components"===this.activeTab,a="basics"===this.activeTab;return html`
      <p>I am the Left pane</p>
      <div class="left-pane-tabs-container">
        <div class="tabs-headers">
          <ul>
            <li class="${t?html`active`:nothing}" @click="${()=>{this.setActiveTab("settings")}}">
              Global settings
            </li>
            <li class="${e?html`active`:nothing}" @click="${()=>{this.setActiveTab("components")}}">
              Components
            </li>
            <li class="${a?html`active`:nothing}" @click=${()=>{this.setActiveTab("basics")}}>
              Basics
            </li>
          </ul>
        </div>
        <div class="active-tab">
          ${this.renderTab()}
        </div>
      </div>
    `}createRenderRoot(){return this}renderTab(){switch(this.activeTab){case"settings":return html`Todo: Implement settings tab`;case"components":return html`Todo: Implement components tab`;case"basics":return html`@todo: do we need basics?`;default:return html`Unknown tab: ${this.activeTab}`}}setActiveTab(t){this.activeTab=t}};LeftPane.styles=css`
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

  `,__decorate([property()],LeftPane.prototype,"activeTab",void 0),LeftPane=__decorate([customElement("content-block-editor-left-pane")],LeftPane);export{LeftPane};