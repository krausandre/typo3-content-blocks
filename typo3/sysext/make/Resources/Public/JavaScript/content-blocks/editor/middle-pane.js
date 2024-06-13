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
var __decorate=function(e,t,o,r){var d,i=arguments.length,l=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(d=e[n])&&(l=(i<3?d(l):i>3?d(t,o,l):d(t,o))||l);return i>3&&l&&Object.defineProperty(t,o,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorMiddlePane=class extends LitElement{render(){return console.log(this.fieldList),html`
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

      <p>Add your fields here:</p>

      <ul>
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
    `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),console.log("Dropped - "),console.log(e),this._dispatchFieldTypeDroppedEvent(e.dataTransfer)}_dispatchFieldTypeDroppedEvent(e){this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{data:e}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldList",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldTypes",void 0),ContentBlockEditorMiddlePane=__decorate([customElement("content-block-editor-middle-pane")],ContentBlockEditorMiddlePane);export{ContentBlockEditorMiddlePane};