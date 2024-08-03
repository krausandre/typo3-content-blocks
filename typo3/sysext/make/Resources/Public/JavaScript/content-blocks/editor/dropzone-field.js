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
var __decorate=function(e,t,o,r){var p,n=arguments.length,i=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var d=e.length-1;d>=0;d--)(p=e[d])&&(i=(n<3?p(i):n>3?p(t,o,i):p(t,o))||i);return n>3&&i&&Object.defineProperty(t,o,i),i};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DropzoneField=class extends LitElement{constructor(){super(...arguments),this.position=0,this.level=0,this.parent=null}render(){return console.log("Render dropzone"),html`
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
      <div id="cb-drop-zone-${this.position}"
           class="cb-drop-zone"
           @dragover="${this.handleDragOver}"
           @drop="${this.handleDrop}"
      >
      </div>
    `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),this._dispatchFieldTypeDroppedEvent(e.dataTransfer?.getData("text/plain"))}_dispatchFieldTypeDroppedEvent(e){const t=JSON.parse(e);this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{data:t,position:this.position,level:this.level,parent:this.parent},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};__decorate([property()],DropzoneField.prototype,"position",void 0),__decorate([property()],DropzoneField.prototype,"level",void 0),__decorate([property()],DropzoneField.prototype,"parent",void 0),DropzoneField=__decorate([customElement("dropzone-field")],DropzoneField);export{DropzoneField};