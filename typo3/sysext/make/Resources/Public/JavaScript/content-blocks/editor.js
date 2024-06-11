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
var __decorate=function(e,t,o,r){var i,n=arguments.length,c=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,r);else for(var d=e.length-1;d>=0;d--)(i=e[d])&&(c=(n<3?i(c):n>3?i(t,o,c):i(t,o))||c);return n>3&&c&&Object.defineProperty(t,o,c),c};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/editor/content-block-editor-left-pane.js";import"@typo3/make/editor/content-block-editor-middle-pane.js";import"@typo3/make/editor/content-block-editor-right-pane.js";let Editor=class extends LitElement{render(){return html`
      <p>I am the Editor</p>
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
    `}createRenderRoot(){return this}};__decorate([property()],Editor.prototype,"name",void 0),Editor=__decorate([customElement("content-block-editor")],Editor);export{Editor};