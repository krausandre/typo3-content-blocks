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
var __decorate=function(e,t,r,o){var n,a=arguments.length,l=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(l=(a<3?n(l):a>3?n(t,r,l):n(t,r))||l);return a>3&&l&&Object.defineProperty(t,r,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorRightPane=class extends LitElement{constructor(){super(...arguments),this.setting={icon:"form-textarea",type:"Textarea",properties:[{name:"identifier",dataType:"text",required:!0},{name:"type",dataType:"text",required:!0},{name:"default",dataType:"text"},{name:"placeholder",dataType:"text"},{name:"required",dataType:"boolean"},{name:"enableRichtext",dataType:"boolean"},{name:"richtextConfiguration",dataType:"text",default:"full"},{name:"rows",dataType:"number"}]}}render(){return this.setting?html`
        <p>Field settings: ${this.setting.type}</p>
        ${this.setting.properties.map((e=>html` ${this.renderFormFieldset(e)}`))}
      `:html`<p>Field settings: Choose a Field.</p>`}renderFormFieldset(e){return html`
      <div class="form-group">
        <label for="vendor-prefix">${e.name}</label>
        ${this.renderFormField(e)}
      </div>`}renderFormField(e){switch(e.dataType){case"text":return html`<input type="text" id="${e.name}" value="${e.default}" class="form-control" />`;case"number":return html`<input type="number" id="${e.name}" value="${e.default}" class="form-control" />`;case"select":return html`<select class="form-control" id="${e.name}" >
          <option value="">Choose...</option>
          ${e.options.map((e=>html`
            <option value="${e.value}">${e.label}</option>`))}
        </select>`;case"boolean":return html`<input type="checkbox" id="${e.name}" value="${e.default}" class="form-control" />`;case"textarea":return html`<textarea id="${e.name}" class="form-control">${e.default}</textarea>`;default:return html`Unknown field type property ${e.name}.`}}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorRightPane.prototype,"setting",void 0),ContentBlockEditorRightPane=__decorate([customElement("content-block-editor-right-pane")],ContentBlockEditorRightPane);export{ContentBlockEditorRightPane};