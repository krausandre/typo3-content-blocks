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
var __decorate=function(e,t,o,r){var l,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var i=e.length-1;i>=0;i--)(l=e[i])&&(a=(n<3?l(a):n>3?l(t,o,a):l(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import{live}from"lit/directives/live.js";let ContentBlockEditorRightPane=class extends LitElement{render(){return console.log("Render right pane"),this.schema?html`
        ${this.schema.properties.map((e=>html` ${this.renderFormFieldset(e)}`))}
      `:html`No field was selected`}renderFormFieldset(e){return html`
      <div class="form-group">
        ${"boolean"===e.dataType?this.renderFormField(e):""}
        <label for="${e.name}" class="${"boolean"===e.dataType?"form-check-label fw-bold":"form-label"}">Property '${e.name}'</label>
        ${"boolean"!==e.dataType?this.renderFormField(e):""}
      </div>`}renderFormField(e){switch(e.dataType){case"text":return html`<input @blur="${this.dispatchBlurEvent}" type="text" id="${e.name}" .value="${live(this.values[e.name]||e.default||"")}" class="form-control" />`;case"number":return html`<input @blur="${this.dispatchBlurEvent}" type="number" id="${e.name}" .value="${live(this.values[e.name]||e.default)}" class="form-control" />`;case"select":return html`<select @blur="${this.dispatchBlurEvent}" class="form-control" id="${e.name}" >
          <option value="">Choose...</option>
          ${e.items.map((e=>html`
            <option .value="${live(e.value)}">${e.label}</option>`))}
        </select>`;case"boolean":return html`<input @blur="${this.dispatchBlurEvent}" type="checkbox" id="${e.name}" ?checked=${live(this.values[e.name])} value="${e.default}" class="form-check-input" />`;case"textarea":return html`<textarea @blur="${this.dispatchBlurEvent}" id="${e.name}" class="form-control">${live(e.default)}</textarea>`;default:return html`Unknown field type property ${e.name}.`}}dispatchBlurEvent(e){e.preventDefault();const t=e.target;this.values[t.id]=t.value,this.dispatchEvent(new CustomEvent("updateCbFieldData",{bubbles:!0,composed:!0,detail:{position:this.position,level:this.level,parent:this.parent,values:this.values}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorRightPane.prototype,"values",void 0),__decorate([property()],ContentBlockEditorRightPane.prototype,"schema",void 0),__decorate([property()],ContentBlockEditorRightPane.prototype,"position",void 0),__decorate([property()],ContentBlockEditorRightPane.prototype,"level",void 0),__decorate([property()],ContentBlockEditorRightPane.prototype,"parent",void 0),ContentBlockEditorRightPane=__decorate([customElement("content-block-editor-right-pane")],ContentBlockEditorRightPane);export{ContentBlockEditorRightPane};