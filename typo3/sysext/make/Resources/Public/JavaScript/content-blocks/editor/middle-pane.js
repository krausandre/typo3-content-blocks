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
var __decorate=function(e,t,o,r){var d,i=arguments.length,n=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(d=e[l])&&(n=(i<3?d(n):i>3?d(t,o,n):d(t,o))||n);return i>3&&n&&Object.defineProperty(t,o,n),n};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorMiddlePane=class extends LitElement{render(){let e="";return this.dragActive&&(e="drag-active"),html`
      <style>
        .cb-drop-zone {
          border: 1px dashed #ccc;
          height: 20px;
          margin: 10px 0;
          background-color: #f9f9f9;

          &:focus {
            background-color: #cbffdb;
          }
        }
      </style>

      <p>Add your fields here: ${e}</p>

      <ul class="${e}">
        <li>
          <div id="cb-drop-zone-0"
               class="cb-drop-zone"
               data-position="0"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
        ${this.fieldList.map(((e,t)=>html`
          ${this.renderFieldArea(e,t+1)}
        `))}
      </ul>
    `}renderFieldArea(e,t){const o=this.fieldTypes.filter((t=>t.type===e.type))[0];return html`
      <li>
        <draggable-field-type .fieldTypeSetting="${o}" .fieldTypeInfo="${e}"></draggable-field-type>
        <div id="cb-drop-zone-${t}"
             class="cb-drop-zone"
             data-position="${t}"
             @dragover="${this.handleDragOver}"
             @drop="${this.handleDrop}">
        </div>
      </li>
    `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),console.log("Dropped - "),this.position=parseInt(e.target.dataset.position||"0",10),this._dispatchFieldTypeDroppedEvent(e.dataTransfer?.getData("text/plain"))}_dispatchFieldTypeDroppedEvent(e){this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{type:e,position:this.position}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldList",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldTypes",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"dragActive",void 0),ContentBlockEditorMiddlePane=__decorate([customElement("content-block-editor-middle-pane")],ContentBlockEditorMiddlePane);export{ContentBlockEditorMiddlePane};