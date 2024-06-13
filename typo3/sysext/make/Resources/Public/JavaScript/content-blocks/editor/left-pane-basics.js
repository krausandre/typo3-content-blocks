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
var __decorate=function(e,t,r,o){var i,s=arguments.length,c=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,o);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(c=(s<3?i(c):s>3?i(t,r,c):i(t,r))||c);return s>3&&c&&Object.defineProperty(t,r,c),c};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneBasics=class extends LitElement{render(){return html`
      <div>
        <h2>Basics</h2>
      </div>
    `}createRenderRoot(){return this}};EditorLeftPaneBasics.styles=css``,EditorLeftPaneBasics=__decorate([customElement("editor-left-pane-basics")],EditorLeftPaneBasics);export{EditorLeftPaneBasics};