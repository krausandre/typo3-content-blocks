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
var __decorate=function(e,t,o,n){var r,c=arguments.length,s=c<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(r=e[i])&&(s=(c<3?r(s):c>3?r(t,o,s):r(t,o))||s);return c>3&&s&&Object.defineProperty(t,o,s),s};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneComponents=class extends LitElement{render(){return html`
      <p>Components...</p>
    `}createRenderRoot(){return this}};EditorLeftPaneComponents.styles=css``,EditorLeftPaneComponents=__decorate([customElement("editor-left-pane-components")],EditorLeftPaneComponents);export{EditorLeftPaneComponents};