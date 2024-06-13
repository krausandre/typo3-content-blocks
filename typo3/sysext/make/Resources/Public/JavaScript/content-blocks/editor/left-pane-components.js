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
var __decorate=function(e,t,o,r){var n,p=arguments.length,i=p<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(i=(p<3?n(i):p>3?n(t,o,i):n(t,o))||i);return p>3&&i&&Object.defineProperty(t,o,i),i};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/draggable-field-type.js";let EditorLeftPaneComponents=class extends LitElement{constructor(){super(...arguments),this.fieldTypes=[{icon:"form-textarea",type:"Textarea",properties:[{name:"test",dataType:"text"}]},{icon:"actions-refresh",type:"Collection",properties:[{name:"test",dataType:"text"}]},{icon:"form-checkbox",type:"Checkbox",properties:[{name:"test",dataType:"text"}]}]}render(){return html`
      <p>Components...</p>
      <ul>
        ${this.fieldTypes.map((e=>html`
              <li>
                <draggable-field-type .fieldTypeSetting="${e}"></draggable-field-type>
              </li>`))}
      </ul>
    `}test(e){console.log("test"+e.detail.type)}createRenderRoot(){return this}};EditorLeftPaneComponents.styles=css``,__decorate([property()],EditorLeftPaneComponents.prototype,"fieldTypes",void 0),EditorLeftPaneComponents=__decorate([customElement("editor-left-pane-components")],EditorLeftPaneComponents);export{EditorLeftPaneComponents};