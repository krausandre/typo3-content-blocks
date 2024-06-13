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
var __decorate=function(e,t,o,r){var n,c=arguments.length,i=c<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(i=(c<3?n(i):c>3?n(t,o,i):n(t,o))||i);return c>3&&i&&Object.defineProperty(t,o,i),i};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/info-box.js";let EditorLeftPaneBasics=class extends LitElement{render(){return html`
      <typo3-infobox severity="2" subject="Oooops an error occured!" content="No basics available"></typo3-infobox>
    `}createRenderRoot(){return this}};EditorLeftPaneBasics.styles=css``,EditorLeftPaneBasics=__decorate([customElement("editor-left-pane-basics")],EditorLeftPaneBasics);export{EditorLeftPaneBasics};