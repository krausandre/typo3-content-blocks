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
var __decorate=function(e,t,r,o){var n,d=arguments.length,l=d<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(l=(d<3?n(l):d>3?n(t,r,l):n(t,r))||l);return d>3&&l&&Object.defineProperty(t,r,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let MiddlePane=class extends LitElement{render(){return html`
      <p>I am the Middle pane</p>

    `}createRenderRoot(){return this}};__decorate([property()],MiddlePane.prototype,"name",void 0),MiddlePane=__decorate([customElement("content-block-editor-middle-pane")],MiddlePane);export{MiddlePane};