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
var __decorate=function(t,e,o,n){var c,r=arguments.length,i=r<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,o,n);else for(var l=t.length-1;l>=0;l--)(c=t[l])&&(i=(r<3?c(i):r>3?c(e,o,i):c(e,o))||i);return r>3&&i&&Object.defineProperty(e,o,i),i};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";let ContentBlockEditor=class extends LitElement{constructor(){super(),console.log("ContentBlockEditor constructor")}render(){return html`
      <p>I am the Editor.</p>
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane></content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane></content-block-editor-right-pane>
        </div>
      </div>
      <button @click="${()=>{this._dispatchBackEvent()}}" type="button" class="btn btn-primary">Back</button>
    `}createRenderRoot(){return this}_dispatchBackEvent(){this.dispatchEvent(new CustomEvent("contentBlockBack",{}))}};__decorate([property()],ContentBlockEditor.prototype,"contentBlockName",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};