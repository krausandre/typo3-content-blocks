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
var __decorate=function(e,t,o,r){var l,n=arguments.length,i=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(l=e[s])&&(i=(n<3?l(i):n>3?l(t,o,i):l(t,o))||i);return n>3&&i&&Object.defineProperty(t,o,i),i};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneGlobalSettings=class extends LitElement{render(){return html`
      <p>Global Settings: this is the Lit Element.</p>
    `}createRenderRoot(){return this}};EditorLeftPaneGlobalSettings.styles=css``,EditorLeftPaneGlobalSettings=__decorate([customElement("editor-left-pane-global-settings")],EditorLeftPaneGlobalSettings);export{EditorLeftPaneGlobalSettings};