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
var __decorate=function(e,o,t,r){var l,i=arguments.length,n=i<3?o:null===r?r=Object.getOwnPropertyDescriptor(o,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,o,t,r);else for(var s=e.length-1;s>=0;s--)(l=e[s])&&(n=(i<3?l(n):i>3?l(o,t,n):l(o,t))||n);return i>3&&n&&Object.defineProperty(o,t,n),n};import{html,LitElement,css}from"lit";import{customElement}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let EditorLeftPaneContentBlockSettings=class extends LitElement{render(){return html`
      <p>Content Block Settings</p>
      <div class="form-group">
        <label for="extension">Extension</label>
        <select class="form-control" id="extension">
          <option value="0">Choose...</option>
          <option value="1">Extension 1</option>
          <option value="2">Extension 2</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor">Vendor</label>
        <input type="text" id="vendor" class="form-control" />
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" class="form-control" />
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" class="form-control" />
      </div>
      <div class="form-group">
        <label for="prefix">Prefix fields?</label>
        <input type="checkbox" id="prefix" class="form-control" />
      </div>
      <div class="form-group">
        <label for="prefix-type">Prefix type</label>
        <select class="form-control" id="prefix-type">
          <option value="">Choose...</option>
          <option value="full">Full</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor-prefix">Vendor prefix</label>
        <input type="text" id="vendor-prefix" class="form-control" />
      </div>
      <div class="form-group">
        <label for="priority">Priority</label>
        <input type="number" id="priority" class="form-control" />
      </div>
      <div class="form-group">
        <label for="group">Group</label>
        <select class="form-control" id="group">
          <option value="">Choose...</option>
          <option value="group1">Group 1</option>
          <option value="group2">Group 2</option>
        </select>
      </div>
      <div class="form-group">
        <button>Save</button>
      </div>
    `}createRenderRoot(){return this}};EditorLeftPaneContentBlockSettings.styles=css``,EditorLeftPaneContentBlockSettings=__decorate([customElement("editor-left-pane-content-block-settings")],EditorLeftPaneContentBlockSettings);export{EditorLeftPaneContentBlockSettings};