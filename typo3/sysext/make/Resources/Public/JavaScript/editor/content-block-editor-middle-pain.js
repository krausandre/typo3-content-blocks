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
var __decorate=function(e,t,o,r){var n,i=arguments.length,d=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(d=(i<3?n(d):i>3?n(t,o,d):n(t,o))||d);return i>3&&d&&Object.defineProperty(t,o,d),d};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorMiddlePain=class extends LitElement{render(){return html`
      <p>I am the Middle Pain</p>

    `}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePain.prototype,"name",void 0),ContentBlockEditorMiddlePain=__decorate([customElement("content-block-editor-middle-pain")],ContentBlockEditorMiddlePain);export{ContentBlockEditorMiddlePain};