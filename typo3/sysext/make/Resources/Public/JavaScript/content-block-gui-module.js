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
var __decorate=function(t,e,o,n){var r,l=arguments.length,c=l<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,n);else for(var i=t.length-1;i>=0;i--)(r=t[i])&&(c=(l<3?r(c):l>3?r(e,o,c):r(e,o))||c);return l>3&&c&&Object.defineProperty(e,o,c),c};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-block-list.js";import"@typo3/make/content-block-editor.js";import"@typo3/backend/element/spinner-element.js";let ContentBlockGuiModule=class extends LitElement{render(){return"list"===this.status?html`<content-block-list></content-block-list>`:"editor"===this.status?html`<content-block-editor></content-block-editor>`:html`<spinner-element></spinner-element>`}createRenderRoot(){return this}};__decorate([property()],ContentBlockGuiModule.prototype,"status",void 0),ContentBlockGuiModule=__decorate([customElement("content-block-gui-module")],ContentBlockGuiModule);export{ContentBlockGuiModule};