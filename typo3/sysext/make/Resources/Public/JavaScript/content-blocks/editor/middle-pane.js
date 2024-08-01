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
var __decorate=function(e,t,r,o){var d,i=arguments.length,l=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(d=e[a])&&(l=(i<3?d(l):i>3?d(t,r,l):d(t,r))||l);return i>3&&l&&Object.defineProperty(t,r,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorMiddlePane=class extends LitElement{render(){console.log("Render middle pane");let e="";return this.dragActive&&(e="drag-active"),html`
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
      <ul class="list-unstyled row ${e}">
        <li>
          <div id="cb-drop-zone-0"
               class="cb-drop-zone"
               data-position="0"
               data-level="0"
               data-parent="0"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
        ${this.fieldList.map(((e,t)=>html`
          ${this.renderFieldArea(e,t+1,0,0)}
        `))}
      </ul>
      <pre>
        ${e}
      </pre>
    `}renderFieldArea(e,t,r,o){const d=this.fieldTypes.filter((t=>t.type===e.type))[0];return"Collection"===e.type?html`
        ${this.renderDraggableFieldType(d,e,t,r,o,!0,!1)}
        <li>
          <ul>
            ${this.renderDraggableFieldType(d,e,0,r+1,t-1,!1,!0)}
            ${e.fields?.map(((e,o)=>html`
              ${this.renderFieldArea(e,o+1,r+1,t-1)}
            `))}
          </ul>
        </li>
        ${this.renderDraggableFieldType(d,e,t,r,o,!1,!0)}
      `:this.renderDraggableFieldType(d,e,t,r,o)}renderDraggableFieldType(e,t,r,o,d,i=!0,l=!0){return i&&!l?html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${e}"
            .fieldTypeInfo="${t}"
            .position="${r-1}"
            .level="${o+1}"
            .parent="${d}"
            showDeleteButton="true"
          ></draggable-field-type>
        </li>
      `:!i&&l?html`
        <li>
          <div id="cb-drop-zone-${r}-${o}-${d}"
             class="cb-drop-zone"
             data-position="${r}"
             data-level="${o}"
             data-parent="${d}"
             @dragover="${this.handleDragOver}"
             @drop="${this.handleDrop}">
          </div>
        </li>
      `:html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${e}"
            .fieldTypeInfo="${t}"
            .position="${r-1}"
            .level="${o+1}"
            .parent="${d}"
            showDeleteButton="true"
          ></draggable-field-type>
          <div id="cb-drop-zone-${r}-${o}-${d}"
               class="cb-drop-zone"
               data-position="${r}"
               data-level="${o}"
               data-parent="${d}"
               @dragover="${this.handleDragOver}"
               @drop="${this.handleDrop}">
          </div>
        </li>
      `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),this.position=parseInt(e.target.dataset.position||"0",10),this.level=parseInt(e.target.dataset.level||"0",10),this.parent=parseInt(e.target.dataset.parent||"0",10),this._dispatchFieldTypeDroppedEvent(e.dataTransfer?.getData("text/plain"))}_dispatchFieldTypeDroppedEvent(e){const t=JSON.parse(e);this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{data:t,position:this.position,level:this.level,parent:this.parent}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldList",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldTypes",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"dragActive",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"position",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"level",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"parent",void 0),ContentBlockEditorMiddlePane=__decorate([customElement("content-block-editor-middle-pane")],ContentBlockEditorMiddlePane);export{ContentBlockEditorMiddlePane};