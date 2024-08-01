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
var __decorate=function(e,t,i,r){var o,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(n=(a<3?o(n):a>3?o(t,i,n):o(t,i))||n);return a>3&&n&&Object.defineProperty(t,i,n),n};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{constructor(){super(...arguments),this.identifierIndex=0,this.position=0,this.level=0,this.parent=0,this.showDeleteButton=!1}render(){if(this.fieldTypeSetting){let e=this.fieldTypeSetting.type+"_"+this.identifierIndex,t=this.fieldTypeSetting.type;return this.fieldTypeInfo&&(e=this.fieldTypeInfo.identifier,t=e+" ("+t+")"),html`
        <div class="draggable-field-type d-flex gap-2 text-start btn btn-default d-block mb-3 justify-content-start"
             draggable="true"
             @dragstart="${t=>{this.handleDragStart(t,this.fieldTypeSetting.type,e)}}"
             data-identifier="${e}"
             @click="${()=>{this.activateSettings(e)}}" @dragend="${()=>{this.handleDragEnd()}}"
        >
          <span class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </span>
          <span>${t}</span>
          ${this.showDeleteButton?html`<div class="delete-icon-wrap ms-auto" @click="${()=>{this.removeFieldType()}}">
            <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
          </div>`:""}
        </div>
      `}return html`<p>No FieldTypeSetting</p>`}handleDragStart(e,t,i){const r={type:t,identifier:i};e.dataTransfer?.setData("text/plain",JSON.stringify(r)),this.dispatchEvent(new CustomEvent("dragStart",{bubbles:!0,composed:!0}))}handleDragEnd(){this.dispatchEvent(new CustomEvent("dragEnd",{bubbles:!0,composed:!0}))}activateSettings(e){this.fieldTypeInfo&&this.dispatchEvent(new CustomEvent("activateSettings",{detail:{identifier:e,position:this.position,level:this.level,parent:this.parent},bubbles:!0,composed:!0}))}removeFieldType(){this.dispatchEvent(new CustomEvent("removeFieldType",{detail:{position:this.position,level:this.level,parent:this.parent},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),__decorate([property()],DraggableFieldType.prototype,"fieldTypeInfo",void 0),__decorate([property()],DraggableFieldType.prototype,"identifierIndex",void 0),__decorate([property()],DraggableFieldType.prototype,"position",void 0),__decorate([property()],DraggableFieldType.prototype,"level",void 0),__decorate([property()],DraggableFieldType.prototype,"parent",void 0),__decorate([property()],DraggableFieldType.prototype,"showDeleteButton",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};