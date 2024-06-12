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
var __decorate=function(e,t,r,a){var o,n=arguments.length,l=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,a);else for(var i=e.length-1;i>=0;i--)(o=e[i])&&(l=(n<3?o(l):n>3?o(t,r,l):o(t,r))||l);return n>3&&l&&Object.defineProperty(t,r,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorRightPane=class extends LitElement{constructor(){super(...arguments),this.schema={icon:"form-textarea",type:"Textarea",properties:[{name:"identifier",dataType:"text",required:!0},{name:"type",dataType:"text",required:!0},{name:"default",dataType:"text"},{name:"placeholder",dataType:"text"},{name:"required",dataType:"boolean"},{name:"enableRichtext",dataType:"boolean"},{name:"richtextConfiguration",dataType:"text",default:"full"},{name:"rows",dataType:"number"}]},this.values={identifier:"text1",type:"Textarea",default:"default text",placeholder:"placeholder text",required:!1,enableRichtext:!0,richtextConfiguration:"full",rows:5}}render(){return this.schema?html`
        <p>Field settings: ${this.schema.type}</p>
        ${this.schema.properties.map((e=>html` ${this.renderFormFieldset(e)}`))}
      `:html`<p>Field settings: Choose a Field.</p>`}renderFormFieldset(e){return html`
      <div class="form-group">
        <label for="vendor-prefix">Property '${e.name}'</label>
        ${this.renderFormField(e)}
      </div>`}renderFormField(e){switch(e.dataType){case"text":return html`<input type="text" id="${e.name}" value="${this.values[e.name]||e.default}" class="form-control" />`;case"number":return html`<input type="number" id="${e.name}" value="${this.values[e.name]||e.default}" class="form-control" />`;case"select":return html`<select class="form-control" id="${e.name}" >
          <option value="">Choose...</option>
          ${e.items.map((e=>html`
            <option value="${e.value}">${e.label}</option>`))}
        </select>`;case"boolean":return html`<input type="checkbox" id="${e.name}" ?checked=${this.values[e.name]} value="${e.default}" class="form-control" />`;case"textarea":return html`<textarea id="${e.name}" class="form-control">${e.default}</textarea>`;default:return html`Unknown field type property ${e.name}.`}}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorRightPane.prototype,"schema",void 0),ContentBlockEditorRightPane=__decorate([customElement("content-block-editor-right-pane")],ContentBlockEditorRightPane);export{ContentBlockEditorRightPane};