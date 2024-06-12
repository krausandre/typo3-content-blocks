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
var __decorate=function(t,e,o,n){var i,c=arguments.length,s=c<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var l=t.length-1;l>=0;l--)(i=t[l])&&(s=(c<3?i(s):c>3?i(e,o,s):i(e,o))||s);return c>3&&s&&Object.defineProperty(e,o,s),s};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/list.js";import"@typo3/make/content-blocks/editor.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";let ContentBlockGuiModule=class extends LitElement{constructor(){super(...arguments),this.mode="new",this.data=""}render(){return"list"===this.status?html`
        <button
          type="button"
          class="btn btn-primary me-2"
          @click="${()=>{this.status="editor"}}"
        >
          <typo3-backend-icon identifier="actions-add" size="medium"></typo3-backend-icon>
          Content Block hinzufügen
        </button>
        Test
        <content-block-list
          @contentBlockEdit="${this._contentBlockEditListener}"
          @contentBlockCopy="${this._contentBlockCopyListener}"
        ></content-block-list>
      `:"editor"===this.status?html`<content-block-editor
        data="${this.data}"
        mode="${this.mode}"
        @contentBlockBack="${()=>{this.status="list",this.name="",this.mode="new"}}"></content-block-editor>`:html`<spinner-element></spinner-element>`}createRenderRoot(){return this}_contentBlockEditListener(t){this.name=t.detail.name,this.data=JSON.stringify(t.detail.data),this.mode="edit",this.status="editor"}_contentBlockCopyListener(t){this.name=t.detail.name,this.data=JSON.stringify(t.detail.data),this.mode="copy",this.status="editor"}};__decorate([property()],ContentBlockGuiModule.prototype,"status",void 0),ContentBlockGuiModule=__decorate([customElement("content-block-gui-module")],ContentBlockGuiModule);export{ContentBlockGuiModule};