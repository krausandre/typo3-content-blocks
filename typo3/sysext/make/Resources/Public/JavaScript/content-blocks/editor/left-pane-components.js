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
var __decorate=function(e,t,o,r){var n,i=arguments.length,p=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(p=(i<3?n(p):i>3?n(t,o,p):n(t,o))||p);return i>3&&p&&Object.defineProperty(t,o,p),p};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/draggable-field-type.js";let EditorLeftPaneComponents=class extends LitElement{constructor(){super(...arguments),this.fieldTypes=[{icon:"form-textarea",type:"Textarea"},{icon:"actions-refresh",type:"Collection"},{icon:"form-checkbox",type:"Checkbox"}]}render(){return html`
      <p>Components...</p>
      <ul>
        ${this.fieldTypes.map((e=>html`
              <li>
                <draggable-field-type fieldTypeSetting="${e}"></draggable-field-type>
              </li>`))}
      </ul>
    `}createRenderRoot(){return this}};EditorLeftPaneComponents.styles=css``,__decorate([property()],EditorLeftPaneComponents.prototype,"fieldTypes",void 0),EditorLeftPaneComponents=__decorate([customElement("editor-left-pane-components")],EditorLeftPaneComponents);export{EditorLeftPaneComponents};