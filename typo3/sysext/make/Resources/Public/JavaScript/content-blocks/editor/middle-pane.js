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
var __decorate=function(e,t,o,r){var l,i=arguments.length,d=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(l=e[n])&&(d=(i<3?l(d):i>3?l(t,o,d):l(t,o))||d);return i>3&&d&&Object.defineProperty(t,o,d),d};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/dropzone-field.js";let ContentBlockEditorMiddlePane=class extends LitElement{render(){console.log("Render middle pane");let e="";return this.dragActive&&(e="drag-active"),html`
      <ul class="list-unstyled row ${e}">
        <li>
          <dropzone-field position="0" level="0"></dropzone-field>
        </li>
        ${this.fieldList.map(((e,t)=>html`
          ${this.renderFieldArea(e,t+1,0,null)}
        `))}
      </ul>
      <pre>
        ${e}
      </pre>
    `}renderFieldArea(e,t,o,r){const l=this.fieldTypes.filter((t=>t.type===e.type))[0];return"Collection"===e.type?html`
        ${this.renderDraggableFieldType(l,e,t,o,e,!0,!1)}
        <li>
          <ul>
            ${this.renderDraggableFieldType(l,e,0,o+1,e,!1,!0)}
            ${e.fields?.map(((t,r)=>html`
              ${this.renderFieldArea(t,r+1,o+1,e)}
            `))}
          </ul>
        </li>
        ${this.renderDraggableFieldType(l,e,t,o,e,!1,!0)}
      `:this.renderDraggableFieldType(l,e,t,o,r)}renderDraggableFieldType(e,t,o,r,l,i=!0,d=!0){return i&&!d?html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${e}"
            .fieldTypeInfo="${t}"
            .position="${o}"
            .level="${r}"
            .parent="${l}"
            showDeleteButton="true"
          ></draggable-field-type>
        </li>
      `:!i&&d?html`
        <li>
          <dropzone-field .position="${o}" .level="${r}" .parent="${l}"></dropzone-field>
        </li>
      `:html`
        <li>
          <draggable-field-type
            .fieldTypeSetting="${e}"
            .fieldTypeInfo="${t}"
            .position="${o}"
            .level="${r}"
            .parent="${l}"
            showDeleteButton="true"
          ></draggable-field-type>
          <dropzone-field .position="${o}" .level="${r}" .parent="${l}"></dropzone-field>
        </li>
      `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),this.position=parseInt(e.target.dataset.position||"0",10),this.level=parseInt(e.target.dataset.level||"0",10),this.parent=e.target.dataset.parent,this._dispatchFieldTypeDroppedEvent(e.dataTransfer?.getData("text/plain"))}_dispatchFieldTypeDroppedEvent(e){const t=JSON.parse(e);this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{data:t,position:this.position,level:this.level,parent:this.parent}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldList",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"fieldTypes",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"dragActive",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"position",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"level",void 0),__decorate([property()],ContentBlockEditorMiddlePane.prototype,"parent",void 0),ContentBlockEditorMiddlePane=__decorate([customElement("content-block-editor-middle-pane")],ContentBlockEditorMiddlePane);export{ContentBlockEditorMiddlePane};