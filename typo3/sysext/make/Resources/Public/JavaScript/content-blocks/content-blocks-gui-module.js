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
var __decorate=function(t,e,o,n){var c,i=arguments.length,l=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,o,n);else for(var r=t.length-1;r>=0;r--)(c=t[r])&&(l=(i<3?c(l):i>3?c(e,o,l):c(e,o))||l);return i>3&&l&&Object.defineProperty(e,o,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/list.js";import"@typo3/make/content-blocks/editor.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";let ContentBlockGuiModule=class extends LitElement{constructor(){super(...arguments),this.contentBlockName=""}render(){return"list"===this.status?html`
        <button
          type="button"
          class="btn btn-primary me-2"
          @click="${()=>{this.status="editor"}}"
        >
          <typo3-backend-icon identifier="actions-add" size="medium"></typo3-backend-icon>
          Content Block hinzufügen
        </button>
        Test
        <content-block-list @contentBlockEdit="${this._contentBlockEditListener}"></content-block-list>
      `:"editor"===this.status?html`<content-block-editor
        name="${this.contentBlockName}"
        @contentBlockBack="${()=>{this.status="list",this.contentBlockName=""}}"
      ></content-block-editor>`:html`<spinner-element></spinner-element>`}createRenderRoot(){return this}_contentBlockEditListener(t){this.contentBlockName=t.detail.contentBlockName,this.status="editor"}};__decorate([property()],ContentBlockGuiModule.prototype,"status",void 0),ContentBlockGuiModule=__decorate([customElement("content-block-gui-module")],ContentBlockGuiModule);export{ContentBlockGuiModule};