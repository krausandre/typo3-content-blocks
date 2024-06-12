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
var __decorate=function(e,t,o,l){var i,r=arguments.length,s=r<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,o):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,l);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneContentBlockSettings=class extends LitElement{render(){return this.groups=JSON.parse(this.groups),this.groups=Object.keys(this.groups).map((e=>this.groups[e])),this.extensions=JSON.parse(this.extensions),this.extensions=Object.keys(this.extensions).map((e=>this.extensions[e])),html`
      <div class="form-group">
        <label for="extension" class="form-label">Extension</label>
        <select class="form-control" id="extension">
          <option value="0">Choose...</option>
          ${this.extensions.map((e=>html`
            <option value="${e.package}">${e.extension}</option>
          `))}
        </select>
      </div>
      <div class="form-group">
        <label for="vendor" class="form-label">Vendor</label>
        <input type="text" id="vendor" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input type="text" id="name" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="title" class="form-label">Title</label>
        <input type="text" id="title" class="form-control" value="${this.contentBlockYaml.title}" />
      </div>
      <div class="form-group">
        <input type="checkbox" id="prefix" class="form-check-input" ?checked=${this.contentBlockYaml.prefixFields} />
        <label for="prefix" class="form-check-label">Prefix fields?</label>
      </div>
      <div class="form-group">
        <label for="prefix-type" class="form-label">Prefix type</label>
        <select class="form-control" id="prefix-type">
          <option value="">Choose...</option>
          <option value="full" ?selected="${"full"===this.contentBlockYaml.prefixType}" >Full</option>
          <option value="vendor" ?selected="${"vendor"===this.contentBlockYaml.prefixType}" >Vendor</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor-prefix" class="form-label">Vendor prefix</label>
        <input type="text" id="vendor-prefix" class="form-control" value="${this.contentBlockYaml.vendorPrefix}" />
      </div>
      <div class="form-group">
        <label for="priority" class="form-label">Priority</label>
        <input type="number" id="priority" class="form-control" value="${this.contentBlockYaml.priority}" />
      </div>
      <div class="form-group">
        <label for="group" class="form-label">Group</label>
        <select class="form-control" id="group">
          <option value="">Choose...</option>
          ${this.groups.map((e=>html`
            <option value="${e.key}">${e.label}</option>
          `))}
        </select>
      </div>
      <div class="form-group">
        <a href="#" class="btn btn-success">
          <span class="t3js-icon icon icon-size-small icon-state-default icon-apps-filetree-folder-default" data-identifier="apps-filetree-folder-default" aria-hidden="true">
            <typo3-backend-icon identifier="actions-save" size="small"></typo3-backend-icon>
          </span>  Save
        </a>
      </div>
    `}createRenderRoot(){return this}};EditorLeftPaneContentBlockSettings.styles=css``,__decorate([property()],EditorLeftPaneContentBlockSettings.prototype,"groups",void 0),__decorate([property()],EditorLeftPaneContentBlockSettings.prototype,"extensions",void 0),__decorate([property()],EditorLeftPaneContentBlockSettings.prototype,"contentBlockYaml",void 0),EditorLeftPaneContentBlockSettings=__decorate([customElement("editor-left-pane-content-block-settings")],EditorLeftPaneContentBlockSettings);export{EditorLeftPaneContentBlockSettings};