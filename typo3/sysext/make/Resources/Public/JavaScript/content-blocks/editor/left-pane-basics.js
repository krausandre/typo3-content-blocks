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
var __decorate=function(e,t,r,o){var s,c=arguments.length,i=c<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(i=(c<3?s(i):c>3?s(t,r,i):s(t,r))||i);return c>3&&i&&Object.defineProperty(t,r,i),i};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneBasics=class extends LitElement{render(){return html`
      <p>Basics...</p>
    `}createRenderRoot(){return this}};EditorLeftPaneBasics.styles=css``,EditorLeftPaneBasics=__decorate([customElement("editor-left-pane-basics")],EditorLeftPaneBasics);export{EditorLeftPaneBasics};