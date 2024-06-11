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
var __decorate=function(t,e,o,n){var r,c=arguments.length,i=c<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,o,n);else for(var d=t.length-1;d>=0;d--)(r=t[d])&&(i=(c<3?r(i):c>3?r(e,o,i):r(e,o))||i);return c>3&&i&&Object.defineProperty(e,o,i),i};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";let ContentBlockEditor=class extends LitElement{constructor(){super(),this.name="",this.mode="",this.loading=!1}render(){return html`
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
      <button @click="${()=>{this._dispatchBackEvent()}}" type="button" class="btn btn-primary">Back
      </button>
    `}createRenderRoot(){return console.log("createRenderRoot"),this}renderLoader(){return html`
      <div class="loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
      `}_dispatchBackEvent(){this.dispatchEvent(new CustomEvent("contentBlockBack",{}))}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"contentBlockData",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};