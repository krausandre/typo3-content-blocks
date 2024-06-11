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
var __decorate=function(t,e,o,n){var c,i=arguments.length,r=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(c=t[a])&&(r=(i<3?c(r):i>3?c(e,o,r):c(e,o))||r);return i>3&&r&&Object.defineProperty(e,o,r),r};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";let ContentBlockEditor=class extends LitElement{constructor(){super(),this.name="",this.loading=!1,this.contentBlockData={name:"",yaml:{},icon:{},iconHideInMenu:{},hostExtension:"",extPath:""}}render(){return this.loading?this.renderLoader():html`
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
    `}createRenderRoot(){return this._fetchContentBlockData(),this}renderLoader(){return html`
      <div class="loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
      `}_fetchContentBlockData(){this.loading=!0,new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_get_cb).post({name:this.name}).then((async t=>{const e=await t.resolve();this.contentBlockData=e.body,this.loading=!1})).catch((t=>{console.error(t),this.loading=!1}))}_dispatchBackEvent(){this.dispatchEvent(new CustomEvent("contentBlockBack",{}))}};__decorate([property()],ContentBlockEditor.prototype,"contentBlockData",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};