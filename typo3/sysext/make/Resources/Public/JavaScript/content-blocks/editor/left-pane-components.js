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
var __decorate=function(e,t,o,r){var n,l=arguments.length,s=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,r);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(s=(l<3?n(s):l>3?n(t,o,s):n(t,o))||s);return l>3&&s&&Object.defineProperty(t,o,s),s};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/draggable-field-type.js";let EditorLeftPaneComponents=class extends LitElement{constructor(){super(...arguments),this.fieldTypes=[{icon:"form-textarea",type:"Textarea",properties:[{name:"test",dataType:"text"}]},{icon:"actions-refresh",type:"Collection",properties:[{name:"test",dataType:"text"}]},{icon:"form-checkbox",type:"Checkbox",properties:[{name:"test",dataType:"text"}]}]}render(){return html`
      <ul class="list-unstyled row">
        ${this.fieldTypes.map((e=>html`
              <li class="col-12 col-xl-6 col-xxl-4">
                <draggable-field-type .fieldTypeSetting="${e}"></draggable-field-type>
              </li>`))}
      </ul>
    `}test(e){console.log("test"+e.detail.type)}createRenderRoot(){return this}};EditorLeftPaneComponents.styles=css``,__decorate([property()],EditorLeftPaneComponents.prototype,"fieldTypes",void 0),EditorLeftPaneComponents=__decorate([customElement("editor-left-pane-components")],EditorLeftPaneComponents);export{EditorLeftPaneComponents};