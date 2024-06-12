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
var __decorate=function(e,t,o,r){var n,l=arguments.length,a=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(a=(l<3?n(a):l>3?n(t,o,a):n(t,o))||a);return l>3&&a&&Object.defineProperty(t,o,a),a};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorRightPane=class extends LitElement{render(){return this.fieldconfig?(this.schema=JSON.parse(this.fieldconfig),html`
        <p>Field settings: ${this.schema.type}</p>
        ${this.schema.properties.map((e=>html` ${this.renderFormFieldset(e)}`))}
      `):html`<p>Field settings: Choose a Field.</p>`}renderFormFieldset(e){return html`
      <div class="form-group">
        <label for="vendor-prefix">Property '${e.name}'</label>
        ${this.renderFormField(e)}
      </div>`}renderFormField(e){switch(e.dataType){case"text":return html`<input type="text" id="${e.name}" value="${this.values[e.name]||e.default}" class="form-control" />`;case"number":return html`<input type="number" id="${e.name}" value="${this.values[e.name]||e.default}" class="form-control" />`;case"select":return html`<select class="form-control" id="${e.name}" >
          <option value="">Choose...</option>
          ${e.items.map((e=>html`
            <option value="${e.value}">${e.label}</option>`))}
        </select>`;case"boolean":return html`<input type="checkbox" id="${e.name}" ?checked=${this.values[e.name]} value="${e.default}" class="form-control" />`;case"textarea":return html`<textarea id="${e.name}" class="form-control">${e.default}</textarea>`;default:return html`Unknown field type property ${e.name}.`}}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorRightPane.prototype,"fieldconfig",void 0),__decorate([property()],ContentBlockEditorRightPane.prototype,"values",void 0),ContentBlockEditorRightPane=__decorate([customElement("content-block-editor-right-pane")],ContentBlockEditorRightPane);export{ContentBlockEditorRightPane};