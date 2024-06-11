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
var __decorate=function(t,e,o,r){var n,i=arguments.length,c=i<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,r);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(c=(i<3?n(c):i>3?n(e,o,c):n(e,o))||c);return i>3&&c&&Object.defineProperty(e,o,c),c};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/editor/content-block-editor-left-pain.js";import"@typo3/make/editor/content-block-editor-middle-pain.js";import"@typo3/make/editor/content-block-editor-right-pain.js";let ContentBlockEditor=class extends LitElement{render(){return html`
      <p>I am the Editor</p>
      <content-block-editor-left-pain></content-block-editor-left-pain>
      <content-block-editor-middle-pain></content-block-editor-middle-pain>
      <content-block-editor-right-pain></content-block-editor-right-pain>
    `}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};